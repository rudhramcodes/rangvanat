import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paginatedList} from '../src/utils/pagination.js';
test('pagination clamps deleted pages and limits; search escapes regex syntax',async()=>{
 let filter,offset,limit,sort;
 const chain={select(){return this;},sort(v){sort=v;return this;},skip(v){offset=v;return this;},limit(v){limit=v;return this;},async lean(){return ['result'];}};
 const model={async countDocuments(v){filter=v;return 25;},find(){return chain;}};
 const result=await paginatedList(model,{page:'99',limit:'12',search:'[a]'},['title']);
 assert.equal(result.pagination.page,3);assert.equal(offset,24);assert.equal(limit,12);assert.equal(sort._id,-1);
 assert.equal(filter.$or[0].title.test('[a]'),true);assert.equal(filter.$or[0].title.test('a'),false);
 await paginatedList(model,{page:'-1',limit:'999'},['title']);assert.equal(offset,0);assert.equal(limit,100);
 model.countDocuments=async()=>0;
 const empty=await paginatedList(model,{page:'2'},['title']);assert.equal(empty.pagination.page,1);assert.equal(empty.pagination.total,0);
});
