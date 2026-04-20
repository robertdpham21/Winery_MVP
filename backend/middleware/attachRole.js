const attachRole = (User) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { asgardeo_sub: req.userId } });
      if (user) {
        req.userRole = user.role;
        req.dbUser = user;
      }
      next();
    } catch (err) {
      next();
    }
  };
};

export default attachRole;