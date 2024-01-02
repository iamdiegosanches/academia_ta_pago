const jwt = require('jsonwebtoken');
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        const token = req.cookies.token;

        try {
            if (!token) {
                return res.status(401).json({
                    message: "Você não está logado.",
                    status: "error",
                });
            }

            const decoded = jwt.verify(token, jwtSecret);

            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Access forbidden' });
            }

            req.userId = decoded.userId;
            req.userRole = decoded.role;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Unauthorized' });
        }
    };
};

module.exports = authMiddleware;

// Código anterior

// const authMiddleware = (allowedRoles) => {
//     return (req, res, next) => {
//         const token = req.cookies.token;
//         if (req.cookies.token === undefined) {
//             return res.status(401).json({
//                 message: "Você não está logado.",
//                 status: "error",
//             });
//         }
//         if (allowedRoles.includes('client') && !allowedRoles.includes('trainer')) {
//             // somente clientes
//             try {
//                 const decoded = jwt.verify(token, jwtSecret);
//                 if (decoded.role !== 'client') {
//                     return res.status(403).json({ message: 'Access forbidden' });
//                 }
//                 req.userId = decoded.userId;
//                 req.userRole = decoded.role;
//                 next();
//             } catch (error) {
//                 console.log(error);
//                 res.status(401).json( { message: 'Unauthorized'} );
//             }
//         } else if (!allowedRoles.includes('client') && allowedRoles.includes('trainer')) {
//             // somente treinador
//             try {
//                 const decoded = jwt.verify(token, jwtSecret);
//                 if (decoded.role !== 'trainer') {
//                     return res.status(403).json({ message: 'Access forbidden' });
//                 }
//                 req.userId = decoded.userId;
//                 req.userRole = decoded.role;
//                 next();
//             } catch (error) {
//                 console.log(error);
//                 res.status(401).json( { message: 'Unauthorized'} );
//             }
//         }
//     }
// }