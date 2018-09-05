
	Guitar chords finder


	Goods

	— Simple usage;
	— Doesn't need any other JavaScript libraries.


	System requirements

	— JavaScript;
	— Browser, which is not too old :-)


	Example

	<script src="static/js/Harmony.js"></script> <!-- https://github.com/Shushik/Harmony -->
	<script src="static/js/ChordView.js"></script> <!-- https://github.com/Shushik/ChordView -->
	<script src="static/js/ChordFind.js"></script>
	<script>
	    var name = 'G';
	//      var ukulele = ['A', 'E', 'C', 'G'];
	    var ukulele = ['E', 'B', 'G', 'D'];
	    var guitarClassic = ['E', 'B', 'G', 'D', 'A', 'E'];
	    var guitarOpenG = ['D', 'G', 'D', 'B', 'G', 'D'];
	    var guitarRussian = ['D', 'B', 'G', 'D', 'B', 'G', 'D'];

	    function
	        find(name, tune) {
	            var root = document.querySelector('.song__scroll');
	            var chords = new ChordFind({
	                name : name,
	                tune : tune
	            });

	            root.innerHTML = '';

	            chords.found.forEach((item) => {
	                this._view = new ChordView({
	                    title : chords.title,
	                    root : root,
	                    tune : tune,
	                    chord : item
	                });
	            });
	        }

	    find(name, guitarClassic);
</script>
