export const isBuyer = (req, res, next) => {
    if (req.user && req.user.role === "buyer") {
      next();
    } else {
      res.status(403);
      throw new Error("Access denied. Buyers only.");
    }
  };
  
  export const isSeller = (req, res, next) => {
    if (req.user && req.user.role === "seller") {
      next();
    } else {
      res.status(403);
      throw new Error("Access denied. Sellers only.");
    }
  };
  
  export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403);
      throw new Error("Access denied. Admins only.");
    }
  };
  