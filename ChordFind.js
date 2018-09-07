/**
 * Guitar chords viewer based on <canvas>
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 2.0
 * @license MIT
 *
 * @class ChordFind
 *
 * @requires Harmony (https://github.com/Shushik/Harmony)
 */
var ChordFind = ChordFind || (function() {

    // Class definition
    class Self {

        /**
         * @static
         * @const {number} MAXIMUM_OCTAVES_LIMIT
         */
        static get MAXIMUM_OCTAVES_LIMIT() {
            return 4;
        }

        /**
         * @static
         * @const {number} BARRE_FINGERS_LIMIT
         */
        static get BARRE_FINGERS_LIMIT() {
            return 3;
        }

        /**
         * @static
         * @const {number} MAXIMUM_FINGERS_LIMIT
         */
        static get MAXIMUM_FINGERS_LIMIT() {
            return 5;
        }

        /**
         * @static
         * @const {number} MAXIMUM_FRETS_LIMIT
         */
        static get MAXIMUM_FRETS_LIMIT() {
            return 16;
        }

        /**
         * @static
         * @const {number} MAXIMUM_FRETS_WIDTH
         */
        static get MAXIMUM_FRETS_WIDTH() {
            return 4;
        }

        /**
         * @static
         * @const {number} DEFAULT_TUNE
         */
        static get DEFAULT_TUNE() {
            return ['E', 'B', 'G', 'D', 'A', 'E'];
        }

        /**
         * @member {number} total
         */
        get total() {
            if (this._data.chord && this._data.chord.list instanceof Array) {
                return this._data.chord.list.length;
            }

            return 0;
        }

        /**
         * @member {string} title
         */
        get title() {
            return this._data.chord.name;
        }

        /**
         * @member {object} tune
         */
        get tune() {
            return this._data.tune;
        }

        /**
         * @member {object} found
         */
        get found() {
            return [].concat(
                this.foundPure,
                this.foundBarre
            );
        }

        /**
         * @member {object} foundPure
         */
        get foundPure() {
            return this._data.chord.pure.map((item) => {return JSON.parse(item)});
        }

        /**
         * @member {object} foundBarre
         */
        get foundBarre() {
            return this._data.chord.barre.map((item) => {return JSON.parse(item)});
        }

        /**
         * @constructor
         *
         * @param {object} args
         */
        constructor(args = {}) {
            // Create data stack
            this._data = {};

            // Run chord search immediately
            if (typeof args == 'object' && args.name && args.tune) {
                this.find(args);
            }
        }

        /**
         * @private
         * @method _initChord
         *
         * @param {string} name
         * @param {number} offset
         */
        _initChord(name) {
            var
                notes = Harmony.getChord(name);

            // Initial chord object
            this._data.chord = {
                cursor : 0,
                name : Harmony.parseCommonSigns(name),
                notes : null,
                pure : [],
                barre : [],
                fingers : Self.MAXIMUM_FINGERS_LIMIT
            };

            this._data.chord.notes = notes;
        }

        /**
         * @private
         * @method _initHarmony
         *
         * @param {string} name
         * @param {string} tune
         */
        _initHarmony(name, tune = Self.DEFAULT_TUNE) {
            tune = tune instanceof Array ? tune : Self.DEFAULT_TUNE;

            this._data.tonality = Harmony.parseTonalityName(name);
            this._data.clefs = Harmony.getClefs(this._data.tonality);
            this._data.tune = tune;
            this._data.type = Harmony.parseHasFlats(this._data.tonality) ? 'flat' : 'sharp';
        }

        /**
         * @private
         * @method _initString
         *
         * @param {object} item
         * @param {number} index
         */
        _initString(item, index) {
            var
                pos = this._data.chromatic.indexOf(item);

            if (pos === -1) {
                item = Harmony.getSynonym(item, this._data.type);
                pos = this._data.chromatic.indexOf(item);
            }

            // No need to go further
            if (pos === -1) {
                throw new Error('No such ');
            }

            this._data.strings[index] = this._data.chromatic.slice(
                                            pos,
                                            pos + Self.MAXIMUM_FRETS_LIMIT
                                        );
        }

        /**
         * @private
         * @method _initStrings
         */
        _initStrings() {
            this._data.strings = [];
            this._data.chromatic = Harmony.getChromaticScale(
                                       this._data.tonality,
                                       Self.MAXIMUM_OCTAVES_LIMIT
                                   );

            this._data.tune.forEach(this._initString, this);

            delete this._data.chromatic;
        }

        /**
         * @private
         * @method _initOffsets
         *
         * @param {number} first
         */
        _initOffsets(first) {
            // Initiate object
            this._data.offsets = {
                next : 0,
                move : 0,
                limit : 0,
                cursor : first
            };

            // Get maximum frets slice width
            this._data.offsets.limit = this._data.strings.reduce(
                this._initOffsetsLimit,
                -1,
                this
            );

            if (this._data.offsets.limit > Self.MAXIMUM_FRETS_WIDTH) {
                this._data.offsets.limit = Self.MAXIMUM_FRETS_WIDTH;
            }

            // Get frets slice
            this._data.slice = null;
        }

        /**
         * @private
         * @method _initOffsetsLimits
         *
         * @param {number} acc
         * @param {object} index
         * @param {number} index
         * @param {object} arr
         */
        _initOffsetsLimit(acc = -1, item, index, arr) {
            var
                off = -1,
                string = arr[index - 1];

            // No need to go further
            if (!string) {
                return;
            }

            off = item.indexOf(string[0])

            // No need to go further
            if (off == -1) {
                return;
            }

            return Math.max(acc, off);
        }

        /**
         * @private
         * @method _initSlice
         */
        _initSlice() {
            var
                last = this._data.strings[0].length - 1,
                limit = this._data.offsets.cursor + this._data.offsets.limit,
                cursor = this._data.offsets.cursor;

            // No need to go further
            if (limit > last) {
                this._data.slice = null;
                return;
            }

            this._data.slice = [];

            this._data.strings.forEach((item, index) => {
                this._data.slice[index] = item.slice(cursor, limit);

                if (cursor) {
                    this._data.slice[index].unshift(item[0]);
                } else {
                    this._data.slice[index].push(item[4]);
                }
            });
        }

        /**
         * @private
         * @method _cropSliceForPure
         *
         * @param {object} item
         */
        _cropSliceForPure(item) {
            return item.slice(0, 4);
        }

        /**
         * @private
         * @method _cropSliceForBarre
         *
         * @param {object} item
         */
        _cropSliceForBarre(item) {
            return item.slice(1, 5);
        }

        /**
         * @private
         * @method _search
         *
         * @param {string} initial
         * @param {boolean} initial
         */
        _search(initial = '', barre = false) {
            var
                it0 = this._data.strings.length,
                seek = -1,
                first = 0,
                tonic = '',
                string = null;

            // Try to reach a first search position via
            // chord tonic sound seeking
            if (initial) {
                tonic = this._data.chord.notes[0];

                while (--it0 > -1) {
                    string = this._data.strings[it0];
                    seek = string.indexOf(tonic);

                    if (!barre && seek > -1) {
                        first = Math.min(first, seek);
                    } else if (barre && seek > 0) {
                        first = first ? Math.min(first, seek) : seek;
                    }
                }

                // No need to go further
                if (first == -1) {
                    return;
                }

                // Set offsets properties
                this._initOffsets(first);
            }

            // «Slice» strings for needed number of frets
            this._initSlice();

            // Search chord in current position
            if (this._data.slice) {
                this._check(barre);

                // Set next cursor value
                this._data.offsets.cursor += this._data.offsets.next;

                // Recursion
                if (this._data.offsets.next) {
                    this._search('', barre);
                }
            }
        }

        /**
         * @private
         * @method _search
         *
         * @param {boolean} barre
         */
        _check(barre = false) {
            var
                it0 = -1,
                it1 = -1,
                base = -1,
                next = 0,
                note = 0,
                seek = -1,
                notes = this._data.chord.notes.length,
                fingers = barre ? Self.BARRE_FINGERS_LIMIT : Self.MAXIMUM_FINGERS_LIMIT,
                strings = this._data.strings.length,
                correction = barre ? -1 : 0,
                free = {},
                chord = [],
                found = {},
                slice = barre ?
                        this._data.slice.map(this._cropSliceForBarre, this) :
                        this._data.slice.map(this._cropSliceForPure, this),
                string = null;

            // Add barre mark
            if (barre) {
                // No need to go further
                if (!this._data.offsets.cursor) {
                    this._data.offsets.next = 1;
                    return;
                }

                // Set barre mark
                chord.push({
                    barre : true,
                    to : this._data.offsets.cursor
                });
            }

            // Find very base chord sound (tonic)
            it0 = strings;

            while (--it0 > -1) {
                string = slice[it0];
                seek = string.indexOf(this._data.chord.notes[0]);

                // Sound found
                if (base == -1 && seek > -1) {
                    base = it0;
                    next = Math.max(next, seek);

                    // Set finger mark
                    if (seek) {
                        chord.push({
                            at : it0 + 1,
                            to : seek + this._data.offsets.cursor
                        });

                        fingers--;
                    }

                    found[0] = true;

                    note++;
                } else {
                    free[it0] = true;
                }

                // Put thumb for bass only
                if (it0 < strings && fingers == Self.MAXIMUM_FINGERS_LIMIT) {
                    fingers--;
                }
            }

            // Find other base chord sounds
            it0 = 0;

            while (++it0 < notes) {
                it1 = base;

                while (--it1 > -1) {
                    string = slice[it1];
                    seek = string.indexOf(this._data.chord.notes[it0]);

                    // Sound found
                    if (seek > -1 && free[it1] && !found[it0]) {
                        next = Math.max(next, seek);

                        // Set finger mark
                        if (seek && fingers) {
                            chord.push({
                                at : it1 + 1,
                                to : seek + this._data.offsets.cursor
                            });

                            fingers--;
                        }

                        delete free[it1];

                        note++;

                        found[it0] = true;

                        break;
                    }
                }
            }

            // No need to go further
            if (note != notes) {
                return;
            }

            // Find rest of chord sounds
            it0 = strings;

            while (--it0 > -1) {
                if (free[it0]) {
                    it1 = -1;
                    string = slice[it0];

                    while (it0 < base && ++it1 < notes) {
                        seek = string.indexOf(this._data.chord.notes[it1]);

                        // Sound found
                        if (seek > -1) {
                            next = Math.max(next, seek);

                            // Set finger mark
                            if (seek && fingers) {
                                if (fingers) {
                                    chord.push({
                                        at : it0 + 1,
                                        to : seek + this._data.offsets.cursor
                                    });

                                    fingers--;
                                } else {
                                    chord.push({
                                        inactive : true,
                                        at : it0 + 1
                                    });
                                }
                            }

                            delete free[it0];

                            break;
                        }
                    }

                    // Set disabled string mark
                    if (free[it0]) {
                        chord.push({
                            inactive : true,
                            at : it0 + 1
                        });

                        delete free[it0];
                    }
                }
            }

            // No need to go further
            if (
                this._data.offsets.cursor !== 0 &&
                fingers == Self.MAXIMUM_FINGERS_LIMIT
            ) {
                return;
            }

            // Sort chord via strings numbers
            chord.sort((a, b) => {
                if (a.at && b.at) {
                    if (a.at > b.at) {
                        return 1;
                    } else if (a.at < b.at) {
                        return -1;
                    }
                }

                return 0;
            });

            // Prepare JSON string for chord
            chord = JSON.stringify(chord);

            // Save chord into barre or pure chords stack
            if (barre && this._data.chord.barre.indexOf(chord) == -1) {
                this._data.chord.barre.push(chord);
            } else if (!barre && this._data.chord.pure.indexOf(chord) == -1) {
                this._data.chord.pure.push(chord);
            }

            // Set next chord seeking position
            this._data.offsets.next = next + (barre ? 0 : 1);
        }

        /**
         * @method find
         *
         * @param {object} args
         *
         * @returns {object}
         */
        find(args) {
            var
                it0 = -1,
                ln0 = 1;

            this._initHarmony(args.name, args.tune);
            this._initStrings();
            this._initChord(args.name);

            // 
            if (args.alterated) {
                ln0 = this._data.chord.notes.length;
            }

            while (++it0 < ln0) {
                if (it0) {
                    this._data.chord.notes = Harmony.alterChord(
                        this._data.chord.notes,
                        it0
                    );
                }

                if (args.name) {
                    this._search(args.name);
                    this._search(args.name, true);
                }
            }

            return this.found;
        }

    }

    // Class export
    return Self;

})();
