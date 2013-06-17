# TaffyDB banchmark

This benchmark is used to compare <a href="https://github.com/louischatriot/nedb" target="_blank">NeDB</a> to <a href="http://www.taffydb.com/" target="_blank">TaffyDB</a>. I use the same code I use to benchmark NeDB, with the necessary adaptations. Also, since TaffyDB doesn't support persistence, I benchmark it against an in-memory-only NeDB (`-m` option in the NeDB benchmarks).


## Results

NeDB is much faster than TaffyDB on all operations except insert:  

* Insert: 


