
	Guitar chords finder


	Goods

	— Simple usage


	System requirements

	— JavaScript;
	— Browser, which is not too old :-)


	Example

	<script src="Harmony.js"></script> <!-- https://github.com/Shushik/Harmony -->
	<script src="ChordView.js"></script> <!-- https://github.com/Shushik/ChordView -->
	<script src="ChordFind.js"></script>
	<script>
	    // Show alterated chords too
	    var alterated = true;

	    // Chord name
	    var name = 'A6';

	    // Different instruments tunings
	    var guitarBass4 = ['G', 'D', 'A', 'E'];
	    var guitarBass5 = ['G', 'D', 'A', 'E', 'B'];
	    var guitarBass6 = ['B', 'G', 'D', 'A', 'E', 'B'];
	    var guitarOpenG = ['D', 'G', 'D', 'B', 'G', 'D'];
	    var guitarClassic = ['E', 'B', 'G', 'D', 'A', 'E'];    
	    var guitarRussian = ['D', 'B', 'G', 'D', 'B', 'G', 'D'];
	    var guitarUkulele1 = ['A', 'E', 'C', 'G'];
	    var guitarUkulele2 = ['E', 'B', 'G', 'D'];

	    function
	        find(name, tune) {
	            var root = document.querySelector('.song__scroll');
	            var chords = new ChordFind({
	                alterated : alterated,
	                name : name,
	                tune : tune
	            });

	            root.innerHTML = '';

	            chords.found.forEach((item) => {
	                new ChordView({
	                    title : chords.title,
	                    root : root,
	                    tune : tune,
	                    chord : item
	                });
	            });
	        }

	    find(name, guitarClassic);
</script>
