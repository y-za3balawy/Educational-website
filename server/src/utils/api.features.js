export class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        this.pagination = { page, limit, skip };
        return this;
    }

    search(fields = ['title', 'content']) {
        if (this.queryString.search) {
            const searchRegex = new RegExp(this.queryString.search, 'i');
            const searchQuery = fields.map(field => ({ [field]: searchRegex }));
            this.query = this.query.find({ $or: searchQuery });
        }
        return this;
    }
}

export const getPaginationInfo = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};
