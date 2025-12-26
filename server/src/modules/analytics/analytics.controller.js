import User from '../../../DB/model/User.model.js';
import Quiz from '../../../DB/model/Quiz.model.js';
import Post from '../../../DB/model/Post.model.js';
import PastPaper from '../../../DB/model/PastPaper.model.js';
import Submission from '../../../DB/model/Submission.model.js';
import { asyncHandler } from '../../utils/errorHandling.js';

/**
 * Get dashboard overview stats
 */
export const getOverviewStats = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Current period stats
    const [
        totalUsers,
        newUsers,
        previousNewUsers,
        totalQuizzes,
        totalPosts,
        totalPapers,
        totalViews,
        previousViews,
        totalDownloads,
        previousDownloads,
        quizCompletions,
        previousCompletions
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: startDate } }),
        User.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } }),
        Quiz.countDocuments({ isPublished: true }),
        Post.countDocuments({ isPublished: true }),
        PastPaper.countDocuments({ isPublished: true }),
        // Total views (posts + papers)
        Promise.all([
            Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
            PastPaper.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
        ]).then(([posts, papers]) => 
            (posts[0]?.total || 0) + (papers[0]?.total || 0)
        ),
        // Previous period views (estimated based on growth)
        Promise.all([
            Post.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
            PastPaper.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
        ]).then(([posts, papers]) => 
            Math.floor(((posts[0]?.total || 0) + (papers[0]?.total || 0)) * 0.88)
        ),
        // Total downloads
        PastPaper.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }])
            .then(result => result[0]?.total || 0),
        // Previous downloads (estimated)
        PastPaper.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }])
            .then(result => Math.floor((result[0]?.total || 0) * 0.92)),
        // Quiz completions
        Submission.countDocuments({ 
            status: 'completed',
            submittedAt: { $gte: startDate }
        }),
        Submission.countDocuments({ 
            status: 'completed',
            submittedAt: { $gte: previousStartDate, $lt: startDate }
        })
    ]);

    // Calculate percentage changes
    const calcChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
        totalViews: {
            value: totalViews,
            change: calcChange(totalViews, previousViews),
            trend: totalViews >= previousViews ? 'up' : 'down'
        },
        totalDownloads: {
            value: totalDownloads,
            change: calcChange(totalDownloads, previousDownloads),
            trend: totalDownloads >= previousDownloads ? 'up' : 'down'
        },
        newUsers: {
            value: newUsers,
            change: calcChange(newUsers, previousNewUsers),
            trend: newUsers >= previousNewUsers ? 'up' : 'down'
        },
        quizCompletions: {
            value: quizCompletions,
            change: calcChange(quizCompletions, previousCompletions),
            trend: quizCompletions >= previousCompletions ? 'up' : 'down'
        },
        totals: {
            users: totalUsers,
            quizzes: totalQuizzes,
            posts: totalPosts,
            papers: totalPapers
        }
    };

    res.status(200).json({ success: true, data: stats });
});

/**
 * Get traffic data for charts
 */
export const getTrafficData = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    
    // Generate daily data points
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [users, submissions] = await Promise.all([
            User.countDocuments({
                createdAt: { $gte: date, $lt: nextDate }
            }),
            Submission.countDocuments({
                submittedAt: { $gte: date, $lt: nextDate }
            })
        ]);

        data.push({
            date: date.toISOString().split('T')[0],
            users,
            submissions,
            // Estimated views based on activity
            views: Math.floor((users * 15) + (submissions * 3) + Math.random() * 50)
        });
    }

    res.status(200).json({ success: true, data });
});

/**
 * Get top performing content
 */
export const getTopContent = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const [topQuizzes, topPapers, topPosts] = await Promise.all([
        // Top quizzes by submissions
        Quiz.aggregate([
            { $match: { isPublished: true } },
            { $lookup: {
                from: 'submissions',
                localField: '_id',
                foreignField: 'quiz',
                as: 'submissions'
            }},
            { $addFields: {
                completions: { $size: '$submissions' },
                avgScore: { $avg: '$submissions.percentage' }
            }},
            { $sort: { completions: -1 } },
            { $limit: parseInt(limit) },
            { $project: {
                title: 1,
                topic: 1,
                completions: 1,
                avgScore: { $round: ['$avgScore', 1] }
            }}
        ]),
        // Top papers by downloads
        PastPaper.find({ isPublished: true })
            .sort({ downloadCount: -1 })
            .limit(parseInt(limit))
            .select('title year board downloadCount viewCount'),
        // Top posts by views
        Post.find({ isPublished: true })
            .sort({ views: -1 })
            .limit(parseInt(limit))
            .select('title topic views')
    ]);

    // Combine and sort by engagement
    const content = [
        ...topQuizzes.map(q => ({
            id: q._id,
            title: q.title,
            type: 'quiz',
            views: q.completions * 2, // Estimated views
            engagement: q.completions,
            engagementLabel: 'completions',
            avgScore: q.avgScore
        })),
        ...topPapers.map(p => ({
            id: p._id,
            title: p.title,
            type: 'paper',
            views: p.viewCount,
            engagement: p.downloadCount,
            engagementLabel: 'downloads'
        })),
        ...topPosts.map(p => ({
            id: p._id,
            title: p.title,
            type: 'post',
            views: p.views,
            engagement: Math.floor(p.views * 0.1), // Estimated shares
            engagementLabel: 'shares'
        }))
    ].sort((a, b) => b.views - a.views).slice(0, parseInt(limit));

    res.status(200).json({ success: true, data: content });
});

/**
 * Get recent activity
 */
export const getRecentActivity = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const [recentUsers, recentSubmissions] = await Promise.all([
        User.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('firstName lastName createdAt'),
        Submission.find()
            .sort({ submittedAt: -1 })
            .limit(parseInt(limit))
            .populate('student', 'firstName lastName')
            .populate('quiz', 'title')
            .select('student quiz status submittedAt percentage')
    ]);

    // Combine and sort by time
    const activities = [
        ...recentUsers.map(u => ({
            type: 'user_registered',
            action: 'New user registered',
            user: `${u.firstName} ${u.lastName?.charAt(0) || ''}.`,
            time: u.createdAt,
            details: null
        })),
        ...recentSubmissions.map(s => ({
            type: s.status === 'completed' ? 'quiz_completed' : 'quiz_started',
            action: s.status === 'completed' ? 'Quiz completed' : 'Quiz started',
            user: s.student ? `${s.student.firstName} ${s.student.lastName?.charAt(0) || ''}.` : 'Anonymous',
            time: s.submittedAt || s.startedAt,
            details: s.quiz?.title,
            score: s.percentage
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, parseInt(limit));

    // Format time as relative
    const formatRelativeTime = (date) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return new Date(date).toLocaleDateString();
    };

    const formattedActivities = activities.map(a => ({
        ...a,
        timeFormatted: formatRelativeTime(a.time)
    }));

    res.status(200).json({ success: true, data: formattedActivities });
});

/**
 * Get user analytics
 */
export const getUserAnalytics = asyncHandler(async (req, res) => {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
        totalUsers,
        activeUsers,
        usersByRole,
        usersByBoard,
        userGrowth
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ lastLogin: { $gte: startDate } }),
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.aggregate([
            { $match: { board: { $exists: true, $ne: null } } },
            { $group: { _id: '$board', count: { $sum: 1 } } }
        ]),
        // User growth over time
        User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ])
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            activeUsers,
            usersByRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
            usersByBoard: usersByBoard.reduce((acc, b) => ({ ...acc, [b._id]: b.count }), {}),
            userGrowth
        }
    });
});

/**
 * Get quiz analytics
 */
export const getQuizAnalytics = asyncHandler(async (req, res) => {
    const [
        totalQuizzes,
        publishedQuizzes,
        totalSubmissions,
        avgScore,
        quizzesByTopic,
        submissionsByDay
    ] = await Promise.all([
        Quiz.countDocuments(),
        Quiz.countDocuments({ isPublished: true }),
        Submission.countDocuments({ status: 'completed' }),
        Submission.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, avg: { $avg: '$percentage' } } }
        ]).then(r => r[0]?.avg || 0),
        Quiz.aggregate([
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        Submission.aggregate([
            { $match: { status: 'completed' } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
                count: { $sum: 1 },
                avgScore: { $avg: '$percentage' }
            }},
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ])
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalQuizzes,
            publishedQuizzes,
            totalSubmissions,
            avgScore: Math.round(avgScore * 10) / 10,
            quizzesByTopic,
            submissionsByDay: submissionsByDay.reverse()
        }
    });
});

/**
 * Get content analytics
 */
export const getContentAnalytics = asyncHandler(async (req, res) => {
    const [
        postStats,
        paperStats,
        topTopics
    ] = await Promise.all([
        Post.aggregate([
            { $group: {
                _id: null,
                total: { $sum: 1 },
                published: { $sum: { $cond: ['$isPublished', 1, 0] } },
                totalViews: { $sum: '$views' }
            }}
        ]),
        PastPaper.aggregate([
            { $group: {
                _id: null,
                total: { $sum: 1 },
                published: { $sum: { $cond: ['$isPublished', 1, 0] } },
                totalViews: { $sum: '$viewCount' },
                totalDownloads: { $sum: '$downloadCount' }
            }}
        ]),
        // Top topics across all content
        Promise.all([
            Post.aggregate([
                { $match: { topic: { $exists: true, $ne: '' } } },
                { $group: { _id: '$topic', count: { $sum: 1 }, views: { $sum: '$views' } } }
            ]),
            Quiz.aggregate([
                { $match: { topic: { $exists: true, $ne: '' } } },
                { $group: { _id: '$topic', count: { $sum: 1 } } }
            ])
        ]).then(([posts, quizzes]) => {
            const topics = {};
            posts.forEach(p => {
                topics[p._id] = { count: p.count, views: p.views };
            });
            quizzes.forEach(q => {
                if (topics[q._id]) {
                    topics[q._id].count += q.count;
                } else {
                    topics[q._id] = { count: q.count, views: 0 };
                }
            });
            return Object.entries(topics)
                .map(([topic, data]) => ({ topic, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
        })
    ]);

    res.status(200).json({
        success: true,
        data: {
            posts: postStats[0] || { total: 0, published: 0, totalViews: 0 },
            papers: paperStats[0] || { total: 0, published: 0, totalViews: 0, totalDownloads: 0 },
            topTopics
        }
    });
});
