const { verifyToken } = require('./jwtMiddleware')

// Function to check user access
function checkUserAcess(req, res, next){
    if (req.user.role != 'user'){
        return res.status(403).json({message: 'Access Denied'});
    } 
    next();
}

// Function to check manager access
function checkManagerAcess(req, res, next){
    if (req.user.role != 'manager'){
        return res.status(403).json({message: 'Access Denied'});
    } 
    next();
}

// Functions to check cashier acess
function checkCashierAcess(req, res, next){
    if (req.user.role != 'cashier'){
        return res.status(403).json({message: 'Access Denied'});
    } 
    next();
}

module.exports = {checkUserAcess, checkManagerAcess, checkCashierAcess};