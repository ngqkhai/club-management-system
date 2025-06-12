const userService = require('../services/userService');

class UserController {
  async updateUser(req, res, next) {
    try {
      const userId = req.user.id; // From authMiddleware
      const data = req.body;
      await userService.updateUser(userId, data);
      return res.status(200).json({ message: 'Cập nhật thông tin thành công' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
