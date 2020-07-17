/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns('templateInstances', {
    dataset: {
      notNull: true,
      type: 'varchar(1000)'
    }
  });
};
