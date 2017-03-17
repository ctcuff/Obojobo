'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('launches', {
    id: { type: 'bigserial', primaryKey: true},
    created_at: { type: 'timestamp WITH TIME ZONE', notNull: true, defaultValue: new String('now()')},
    draft_id: { type: 'UUID', notNull: true},
    user_id: { type: 'bigint', notNull:true },
    type: { type: 'varchar', length:200, notNull: true},
    link: { type: 'varchar', length:500, notNull: true},
    data: { type:'jsonb' }
  })
};

exports.down = function(db) {
  return db.dropTable('launches');
};

exports._meta = {
  "version": 1
};
