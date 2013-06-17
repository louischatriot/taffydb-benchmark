# TaffyDB banchmark

This benchmark is used to compare <a href="https://github.com/louischatriot/nedb" target="_blank">NeDB</a> to <a href="http://www.taffydb.com/" target="_blank">TaffyDB</a>. I use the same code I use to benchmark NeDB, with the necessary adaptations. Also, since TaffyDB doesn't support persistence, I benchmark it against an in-memory-only NeDB (`-m` options in the NeDB benchmarks), which is why the NeDB numbers for inserts, updates and removes are higher here than on the NeDB readme.


## Results

NeDB is much faster than TaffyDB on all operations except insert:  

* Insert: TaffyDB 15,900 ops/s VS NeDB 15,300 ops/s
* Find: TaffyDB 82 ops/s VS NeDB 41,300 ops/s
* Update: TaffyDB 84 ops/s VS NeDB 8,800 ops/s
* Remove: TaffyDB 54 ops/s VS NeDB 18,700 ops/s


## Interpretation

We see that insert speeds are comparable but TaffyDB is much slower on operations that require to find documents (find, update, remove). That's because TaffyDB doesn't use indexing while NeDB does. In exchange for slightly slower insertions (very small impact nonetheless), we get much faster lookups. When NeDB is used in-memory and without indexes, it is comparable to TaffyDB (only about 10% faster).


