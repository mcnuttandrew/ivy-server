/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable(
    'templates',
    {
      id: 'id',
      name: {type: 'varchar(1000)', notNull: true},
      creator: {type: 'varchar(1000)', notNull: true},
      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp')
      },
      template: {type: 'json', notNull: true}
    },
    {
      constraints: {
        pk: 'PRIMARY KEY (creator,name)'
      }
    }
  );
  pgm.createTable(
    'template_instances',
    {
      id: 'id',
      template_name: {type: 'varchar(1000)', notNull: true},
      template_creator: {type: 'varchar(1000)', notNull: true},
      name: {notNull: true, type: 'varchar(1000)'},
      instance_creator: {type: 'varchar(1000)'},

      template_instance: {type: 'json', notNull: true},

      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('current_timestamp')
      },
      dataset: {
        notNull: true,
        type: 'varchar(1000)'
      },
      thumbnail: {
        type: 'text'
      }
    },
    {
      // i think this constraint does nothing
      constraints: {
        fk: 'FOREIGN KEY (templateCreator, templateName) REFERENCES templates'
      }
    }
  );
  //   pgm.createIndex('templateInstances', 'templateId');
};

exports.down = pgm => {};
