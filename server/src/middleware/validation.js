import { AppError } from '../utils/ErrorClass.js';

export const validate = (schema) => {
    return (req, res, next) => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        };

        if (schema.body) {
            const { error, value } = schema.body.validate(req.body, validationOptions);
            if (error) {
                const message = error.details.map(detail => detail.message).join(', ');
                return next(new AppError(message, 400));
            }
            req.body = value;
        }

        if (schema.params) {
            const { error, value } = schema.params.validate(req.params, validationOptions);
            if (error) {
                const message = error.details.map(detail => detail.message).join(', ');
                return next(new AppError(message, 400));
            }
            req.params = value;
        }

        if (schema.query) {
            const { error, value } = schema.query.validate(req.query, validationOptions);
            if (error) {
                const message = error.details.map(detail => detail.message).join(', ');
                return next(new AppError(message, 400));
            }
            req.query = value;
        }

        next();
    };
};
