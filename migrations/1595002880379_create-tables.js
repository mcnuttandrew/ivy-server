/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('templates', {
    id: 'id',
    name: {type: 'varchar(1000)', notNull: true},
    creator: {type: 'varchar(1000)', notNull: true},
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    template: {type: 'json', notNull: true}
  });
  pgm.createTable('templateInstances', {
    id: 'id',
    templateId: {
      type: 'integer',
      notNull: true,
      references: '"templates"',
      onDelete: 'cascade'
    },
    references: 'templates',
    template: {type: 'json', notNull: true},

    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
  pgm.createIndex('templateInstances', 'templateId');
};
