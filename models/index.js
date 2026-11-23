const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Category = require('../category/category.model');
const Author = require('../author/author.model');
const Book = require('../book/book.model');
const Reader = require('../reader/reader.model');
const User = require('../user/user.model');
const Loan = require('../loan/loan.model');
const RefreshToken = require('../auth/refreshToken.model');

const BookAuthor = db.define('BookAuthor', {}, { timestamps: false });

function relate(parent, child, name) {
    const foreignKey = { name, type: DataTypes.INTEGER, allowNull: false };
    parent.hasMany(child, { foreignKey, onDelete: 'RESTRICT' });
    child.belongsTo(parent, { foreignKey, onDelete: 'RESTRICT' });
}

relate(Category, Book, 'categoryId');
relate(Book, Loan, 'bookId');
relate(Reader, Loan, 'readerId');
relate(User, Loan, 'userId');
relate(User, RefreshToken, 'userId');
Book.belongsToMany(Author, { through: BookAuthor, foreignKey: 'bookId', otherKey: 'authorId' });
Author.belongsToMany(Book, { through: BookAuthor, foreignKey: 'authorId', otherKey: 'bookId' });

module.exports = { Category, Author, Book, Reader, User, Loan, RefreshToken, BookAuthor };
