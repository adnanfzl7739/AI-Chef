import ShoppingList from '../models/ShoppingList.js'

export const generateFromMealPlan = async (req, res, next) => {
    try {
        const {startDate, endDate} = req.body;
     
        if(!startDate || !endDate) {
            res.status(404).json({
            success: false,
            message: "Please Provide startDate and endDate",
            
        })
        }
           const items = await ShoppingList.generateFromMealPlan(req.user.id, startDate, endDate)
        res.json({
            success: true,
            message: "Shopping List generated from meal plan",
            data: {items}
        })
    } catch(error) {
        next(error)
    }
}
export const getShoppingList = async (req, res, next) => {
    try {
        const grouped = req.query.grouped === 'true';
        const items = grouped 
        ? await ShoppingList.getGroupByCategory(req.user.id)
        : await ShoppingList.findByUserId(req.user.id)
        res.json({
            success: true,
            
            data: {items}
        })
    } catch(error) {
        next(error)
    }
}
export const addItem = async (req, res, next) => {
    try {
        const item = await ShoppingList.create(req.user.id, req.body )
        res.status(201).json({
            success: true,
            message: "Item Added To Shopping List",
            data: {item}
        })
    } catch(error) {
        next(error)
    }
}

export const updateItem = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await ShoppingList.update(id, req.user.id, req.body);
        if(!item) {
            return res.status(404).json({
                success: false,
                message: "Shopping list item not found"
            });
        }
        res.json({
            success: true,
            message: "Item Updated",
            data: {item}
        })
    } catch(error) {
        next(error)
    }
}

export const toggleChecked = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await ShoppingList.toggleChecked(id, req.user.id);
        if(!item) {
            return res.status(404).json({
                success: false,
                message: "Shopping List Item not found"
            });
        }
        res.json({
            success: true,
            
            data: {item}
        })
    } catch(error) {
        next(error)
    }
}
export const deleteRecipe = async (req, res, next) => {
    try {
        const {id} = req.params;
        const item = await ShoppingList.delete(id, req.user.id);
        if(!item) {
            return res.status(404).json({
                success: false,
                message: "shopping list item not found"
            });
        }
        res.json({
            success: true,
            message: "Item deleted Successfully",
            data: {item}
        })
    } catch(error) {
        next(error)
    }
}

export const clearChecked = async (req, res, next) => {
    try {
        const items = await ShoppingList.clearChecked(req.user.id)
        res.json({
            success: true,
            message: "Checked Items Cleared",
            data: {items}
        })
    } catch(error) {
        next(error)
    }
}
export const clearAll = async (req, res, next) => {
    try {
        const mealPlan = await ShoppingList.clearAll(req.user.id )
        res.json({
            success: true,
            message: "Shopping List cleared",
            data: {item}
        })
    } catch(error) {
        next(error)
    }
}

export const addCheckedToPantry = async (req, res, next) => {
    try {
        const item = await ShoppingList.addCheckedToPantry(req.user.id )
        res.json({
            success: true,
            message: "Checked Item Added To Pantry",
            data: {item}
        })
    } catch(error) {
        next(error)
    }
}