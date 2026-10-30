"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIngredients = getIngredients;
exports.postIngredient = postIngredient;
exports.postStockAdjustment = postStockAdjustment;
exports.patchThreshold = patchThreshold;
const inventory_validation_1 = require("./inventory.validation");
const inventory_service_1 = require("./inventory.service");
const apiResponse_1 = require("../../utils/apiResponse");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function getIngredients(req, res, next) {
    try {
        const query = inventory_validation_1.listIngredientsQuerySchema.parse(req.query);
        const result = await (0, inventory_service_1.listIngredients)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Ingredients retrieved successfully',
            data: result.ingredients,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
async function postIngredient(req, res, next) {
    try {
        const input = inventory_validation_1.createIngredientSchema.parse(req.body);
        const ingredient = await (0, inventory_service_1.createIngredient)(input);
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Ingredient created successfully', data: ingredient });
    }
    catch (error) {
        next(error);
    }
}
async function postStockAdjustment(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = inventory_validation_1.adjustStockSchema.parse(req.body);
        const inventory = await (0, inventory_service_1.adjustStock)(req.params.ingredientId, input, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Stock adjusted successfully', data: inventory });
    }
    catch (error) {
        next(error);
    }
}
async function patchThreshold(req, res, next) {
    try {
        const input = inventory_validation_1.updateThresholdSchema.parse(req.body);
        const inventory = await (0, inventory_service_1.updateThreshold)(req.params.ingredientId, input.lowStockThreshold);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Low stock threshold updated successfully', data: inventory });
    }
    catch (error) {
        next(error);
    }
}
