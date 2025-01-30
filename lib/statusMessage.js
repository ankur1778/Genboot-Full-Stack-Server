const AdminMessage = {
  NOT_AUTH: "Access denied: You are not authorized",
};

const TokenMessage = {
  MISSING_TOKEN: "Authorization token is missing",
  INVALID: "Invalid token",
};

const ServerErrorMessage = {
  SERVER_ERROR: "Internal server error",
};

const AuthValidation = {
  INVALID: "Bad Request",
  REGISTERED: "User Registered Successfully",
  EXIST: "User is already exist.",
  WRONG_CREDS: "Wrong Credentials",
  LOGGED: "Login Successfully",
  FAILED: "Login Unsuccessfully",
};

const UserValidation = {
  INVALID_USERID: "Invalid or missing user ID",
  NOT_FOUND: "User not Found",
};

const ProductValidation = {
  INVALID_PRODUCT: "Invalid or missing product ID",
};

const WishListMessage = {
  ADDED: "Item added to wishlist",
  EXIST: "Item already exists in wishlist",
  NOT_FOUND: "Wishlist not found for this user",
  EMPTY: "Product not found in wishlist",
  REMOVED: "Product removed successfully",
};

const OrderMessage = {
  NOT_FOUND: "Order not found",
  INVALID_STATUS: "Invalid status value",
  STATUS_UPDATED: "Order status updated",
  DELETED: "Order deleted successfully",
};

const CartMessages = {
  NOT_FOUND: "Cart not found",
  EMPTY: "Item not in cart",
  REMOVED: "Item removed from cart",
};

module.exports = {
  AdminMessage,
  TokenMessage,
  ServerErrorMessage,
  AuthValidation,
  UserValidation,
  ProductValidation,
  WishListMessage,
  OrderMessage,
  CartMessages,
};
