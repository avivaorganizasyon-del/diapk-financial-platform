'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add unique constraint to phone field in Users table
    await queryInterface.addConstraint('Users', {
      fields: ['phone'],
      type: 'unique',
      name: 'unique_phone_constraint'
    });

    // Update phone field to be required (not null)
    await queryInterface.changeColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove unique constraint
    await queryInterface.removeConstraint('Users', 'unique_phone_constraint');

    // Revert phone field to be optional
    await queryInterface.changeColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  }
};