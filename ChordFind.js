/**
 * Guitar chords viewer based on <canvas>
 *
 * @author Shushik <silkleopard@yandex.ru>
 * @version 2.0
 * @license MIT
 *
 * @class ChordFind
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
         * @const {number} MAXIMUM_FINGERS_LIMIT
         */
        static get MAXIMUM_FINGERS_LIMIT() {
            return 4;
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
         * @member {object} tune
         */
        get tune() {
            return this._data.tune;
        }

        /**
         * @member {object} found
         */
        get found() {
            return this._data.chord.list;
        }

        /**
         * @constructor
         *
         * @param {object} args
         */
        constructor(args = {}) {
            // No need to go further
            if (typeof args != 'object') {
                throw new Error('Config should be an object');
            } else if (!(args.root instanceof HTMLElement)) {
                throw new Error('Root DOM node for chord doesn`t exist');
            }

            // Create data stack
            this._data = {};

            this.find(args);

            this._data.chord.list.forEach((item) => {
                this._view = new ChordView({
                    title : args.name,
                    root : args.root,
                    tune : this._data.tune,
                    chord : item
                });
            });
        }

        /**
         * @private
         * @method _initChord
         */
        _initChord(name) {
            var
                notes = Harmony.getChord(name);

            this._data.chord = {
                cursor : 0,
                name : Harmony.parseChordName(name),
                notes : null,
                list : [],
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
         */
        _initOffsets() {
            // Initiate object
            this._data.offsets = {
                next : 0,
                move : 0,
                limit : 0,
                cursor : 0
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

            // Get frets slice move width
            this._data.offsets.move = 1;
/*
            this._data.offsets.move = Math.floor(this._data.offsets.limit / 2);
            this._data.offsets.move = this._data.offsets.move > Self.MAXIMUM_FRETS_WIDTH ?
                                      Self.MAXIMUM_FRETS_WIDTH :
                                      this._data.offsets.move;
*/

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
            if (initial) {
                this._initOffsets();
            }

            this._initSlice();

            if (this._data.slice) {
                this._check(barre);

                this._data.offsets.cursor += this._data.offsets.next;

                // temp expression
                this._search('', barre);
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
                fingers = Self.MAXIMUM_FINGERS_LIMIT,
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

                chord.push({
                    barre : true,
                    to : this._data.offsets.cursor
                });

                fingers--;
            }

            // Find very base sound (tonic)
            it0 = strings;

            while (--it0 > -1) {
                string = slice[it0];
                seek = string.indexOf(this._data.chord.notes[0]);

                if (base == -1 && seek > -1) {
                    base = it0;
                    next = Math.max(next, seek);

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
            }

            // Find other base sounds
            it0 = 0;

            while (++it0 < notes) {
                it1 = base;

                while (--it1 > -1) {
                    string = slice[it1];
                    seek = string.indexOf(this._data.chord.notes[it0]);

                    if (seek > -1 && free[it1] && !found[it0]) {
                        next = Math.max(next, seek);

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
                this._data.offsets.next = 1;
                return;
            }

            // Find rest of sounds
            it0 = strings;

            while (--it0 > -1) {
                if (free[it0]) {
                    it1 = -1;
                    string = slice[it0];

                    while (it0 < base && ++it1 < notes) {
                        seek = string.indexOf(this._data.chord.notes[it1]);

                        if (seek > -1) {
                            next = Math.max(next, seek);

                            if (seek && fingers) {
                                chord.push({
                                    at : it0 + 1,
                                    to : seek + this._data.offsets.cursor
                                });

                                fingers--;
                            }

                            delete free[it0];

                            break;
                        }
                    }

                    //
                    if (free[it0]) {
                        chord.push({
                            inactive : true,
                            at : it0 + 1
                        });

                        delete free[it0];
                    }
                }
            }

            this._data.offsets.next = barre ? 1 : next + 1;

            this._data.chord.list.push(chord);
        }

        /**
         * @method find
         *
         * @param {object} args
         *
         * @returns {object}
         */
        find(args) {
            this._initHarmony(args.name, args.tune);
            this._initStrings();
            this._initChord(args.name);

            if (args.name) {
                this._search(args.name);
                this._search(args.name, true);
            }

            return this._data.chord.list;
        }

    }

    // Class export
    return Self;

})();
