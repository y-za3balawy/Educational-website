// Shared database utility methods

/**
 * Create a new document
 */
export const createDocument = async (Model, data) => {
    const document = new Model(data);
    return await document.save();
};

/**
 * Find document by ID
 */
export const findById = async (Model, id, populate = '') => {
    return await Model.findById(id).populate(populate);
};

/**
 * Find single document by query
 */
export const findOne = async (Model, query, populate = '') => {
    return await Model.findOne(query).populate(populate);
};

/**
 * Find all documents with optional filters
 */
export const findAll = async (Model, query = {}, options = {}) => {
    const { populate = '', select = '', sort = '-createdAt', limit = 10, skip = 0 } = options;
    return await Model.find(query)
        .populate(populate)
        .select(select)
        .sort(sort)
        .limit(limit)
        .skip(skip);
};

/**
 * Update document by ID
 */
export const updateById = async (Model, id, data, options = { new: true }) => {
    return await Model.findByIdAndUpdate(id, data, options);
};

/**
 * Delete document by ID
 */
export const deleteById = async (Model, id) => {
    return await Model.findByIdAndDelete(id);
};

/**
 * Count documents
 */
export const countDocuments = async (Model, query = {}) => {
    return await Model.countDocuments(query);
};
