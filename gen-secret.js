'use strict';

var UUID = require('node-uuid')
  ;

// for standard builds of node with openssl this is cryptographically strong
// (for other builds of node this module wouldn't even work anyway)
console.log(UUID.v4());
