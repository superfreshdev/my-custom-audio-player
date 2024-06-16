{
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate

    class AudioPlayer extends HTMLElement {

        playing = false;
        currentTime = 0;
        duration = 0;
        volume = 0.4;

        nonAudioAttributes = new Set(['title', 'bar-width', 'bar-gap', 'buffer-percentage']);
        
        initialized = false;

        constructor() {
            super();

            // open mode - allow to see the content on the tag in the browser  
            this.attachShadow( {mode: 'open'});
            this.render();

            this.initializeAudio();
            this.attachEvents();

        }

        /* ----------------------------------------------------- */
        /* Get Attribute from Custom HTML Tempate
        /* ----------------------------------------------------- */
        static get observerAttributes() {
            return ['src', 'title', 'muted', 'crossorigin' , 'loop' , 'preload' ]
        }

        /* ----------------------------------------------------- */
        /* Get Attribute from HTML
        /* ----------------------------------------------------- */
        async attributeChangedCallback( name, oldValue , newValue ) {

            console.log("[attributeChangeCallback]--- " , name , oldValue , newValue )

            switch( name ) {

                case 'src':

                    this.initialized = false;
                    this.render();
                    this.initializeAudio();

                    break;

                case 'muted':
                    // not implemented
                    break;

                default:

            }

            this.updateAudioAttributes( name , newValue );
           
        }

        /* ----------------------------------------------------- */
        /* Get Attribute from HTML
        /* ----------------------------------------------------- */
        updateAudioAttributes( name, value ) {

            if (!this.audio || this.nonAudioAttributes.has(name)) return;
      
            // if the attribute was explicitly set on the audio-player tag
            // set it otherwise remove it
            if (this.attributes.getNamedItem(name)) {

              this.audio.setAttribute(name, value ?? '')

            } else {

              this.audio.removeAttribute(name);
            }


        }
        
        /* ----------------------------------------------------- */
        /* Initialization ( Audio )
        /* ----------------------------------------------------- */
        initializeAudio() {
           
            if( this.initialized ) return;

            this.initialized = true;

            // Web Audio API ( other developers work directly with audio by calling methods & listen , ... )
            this.audioCtx = new AudioContext(); 
            // Volume of Audio
            this.gainNode = this.audioCtx.createGain();
            // Step 1 - Creating Audio Source by calling create & passing audio element 
            this.track = this.audioCtx.createMediaElementSource(this.audio);

            // Step 2 - Attach Nodes , gainNode 1 = 100% , 2 = 200%.
            this.track
                .connect( this.gainNode )
                .connect( this.audioCtx.destination );

        }

       
        /* ----------------------------------------------------- */
        /* AttachEvents ( list of alle events )
        /* ----------------------------------------------------- */
        attachEvents() {

            this.moreAudioOptionsBtn.addEventListener( 'click' , ()=> {


                console.log(" moreAudioOptionsBtn =  clicked" )

                this.moreAudioOptionContainer.classList.add("active");

                this.addLabelClickListeners()
            })

            this.moreAudioOptionsBtn.addEventListener( 'focusout' , ()=> {

                console.log(" moreAudioOptionsBtn =  loose focus" )
                this.moreAudioOptionContainer.classList.remove("active");

            })

            this.playPauseBtn.addEventListener( 'click' , this.togglePlay.bind(this), false )

            // listen to inpuet value of volume 
            this.volumeBar.addEventListener( 'input' , this.changeVolume.bind(this), false )

            // to listen when user click to scroll music 
            this.progressBar.addEventListener( 'input' , ()=> {

                this.seekTo( this.progressBar.value );
            })

            // to get audio duration information we must listen to the load metadata event on the audio tag 
            this.audio.addEventListener( 'loadedmetadata' , ()=> {

                // set duration & current Time on our Element  
                this.progressBar.max = this.audio.duration;
                this.durationEl.textContent = this.getTimeString(this.audio.duration);
                this.updateAudioTime();

                // calc seconds to mins & secs 
                // const mins = parseInt( `${ (this.duration / 60) % 60} , 10`)
                // const secs = `${parseInt( `${this.duration % 60} , 10`)}`.padStart(2,'0')
               
                // Set on View Element - duration 
                // this.durationEl.textContent = `${mins}:${secs}`;

            })

            // we need to listen time update if we scroll audio file 
            this.audio.addEventListener( 'timeupdate', ()=> {
                this.updateAudioTime(this.audio.currentTime);
            }) 

            // handle state if audio is finished ,   // cross.png emoji-correct.png
            this.audio.addEventListener( 'ended', ()=> {
        
                this.playing = false;
                
                // change img src of button 
                this.playPauseBtn.querySelector("img").setAttribute("src", "cross.png" )
               
                // change button bg-color 
                this.playPauseBtn.classList.remove('play-btn');
                this.playPauseBtn.classList.add('pause-btn');

            }, false )

            this.audio.addEventListener('pause', () => {

                this.playing = false;
               
                // change img src of button 
                this.playPauseBtn.querySelector("img").setAttribute("src", "cross.png" )

                // change button bg-color 
                this.playPauseBtn.classList.remove('play-btn');
                this.playPauseBtn.classList.add('pause-btn');

              }, false);
              
              this.audio.addEventListener('play', () => {

                this.playing = true;
                
                // change img src of button 
                this.playPauseBtn.querySelector("img").setAttribute("src", "emoji-correct.png" )

                // change button bg-color 
                this.playPauseBtn.classList.remove('pause-btn');
                this.playPauseBtn.classList.add('play-btn');

              }, false);

     
           
        }

        /* ----------------------------------------------------- */
        /* Update Attribute Ressource  
        /* ----------------------------------------------------- */

        updateAttributeRessource( domElement , strAttribute ) {

            // at least focus on button + img ( src, class )
            if(domElement == 'button') {

                console.log("Is Button Baby" + domElement )
            }


        }

        addLabelClickListeners() {

            for( let i=0; i < this.speedLabels.length; i++ ) {

                this.speedLabels[i].addEventListener( "click" , ()=> {

                    this.speedInputs[i].checked = true;

                    this.speedAudioInfo.innerText = this.speedInputs[i].getAttribute("value");
                } )

            }
            
        }

        /* ----------------------------------------------------- */
        /* Toggle - Play / Stop Audio 
        /* ----------------------------------------------------- */
        async togglePlay() {


            if(this.audioCtx.state === 'suspended') {
                await this.audioCtx.resume();
            }

            if(this.playing) {
                return this.audio.pause();
            }

            return this.audio.play();
            
        }

     

        /* ----------------------------------------------------- */
        /* Time Style  
        /* ----------------------------------------------------- */
        getTimeString(time) {

            const secs = `${parseInt(`${time % 60}`, 10)}`.padStart(2, '0');
            const min = parseInt(`${(time / 60) % 60}`, 10);
        
            return `${min}:${secs}`;
        }

        /* ----------------------------------------------------- */
        /* Change Volume 
        /* ----------------------------------------------------- */
        changeVolume() {

            this.volume = Number(this.volumeBar.value);
      
            if (Number(this.volume) > 1) {
                this.volumeBar.parentNode.className = 'volume-bar over';
            } else if (Number(this.volume) > 0) {
                this.volumeBar.parentNode.className = 'volume-bar half';
            } else {
                this.volumeBar.parentNode.className = 'volume-bar';
            }
            
            if (this.gainNode) {
                this.gainNode.gain.value = this.volume;
            }


        }
        /* ----------------------------------------------------- */
        /* Muted 
        /* ----------------------------------------------------- */
        // toggleMute(muted = null) {
        //     this.volumeBar.value = muted || this.volume === 0 ? this.prevVolume : 0;
        //     this.changeVolume();
        //   }

        
        /* ----------------------------------------------------- */
        /* Set New Jumping Time Stamp
        /* ----------------------------------------------------- */
        seekTo( value ) {
            this.audio.currentTime = value;
        }

        
        /* ----------------------------------------------------- */
        /* Update Audio Time  
        /* ----------------------------------------------------- */
        updateAudioTime(time) {
            this.progressBar.value = this.audio.currentTime;
            this.currentTimeEl.textContent = this.getTimeString(this.audio.currentTime);
        }
        
        style() {
            return `
            <style>

                /* ---------------------------------------- */
                /* Audio Player 
                /* ---------------------------------------- */

                .audio-player {

                    position:realtive;
                    top:0;

                    padding: .6em;

                    display:inline-flex;
                    align-items:center;
                    column-gap:.6em;
                
                    background-color: #f1f3f4;

                    border-radius: .4em;

                    
                }

                .duration { font-weight:bold; }


                /* ---------------------------------------- */
                /* Buttons 
                /* ---------------------------------------- */

            
                button {

                    position:realtive;
                    top:0;
                   
                    appearance : none;
                    border:none;
                    outline:none;

                    border-radius: .4em;

                    min-width: 48px;
                    min-height: 48px;

                    max-width: 48px;
                    max-height: 48px;

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    cursor: pointer;

                }
                
                .play-btn {
                    background-color: #FF8E8E;
                }

                .pause-btn {
                    background-color:#f1f3f4;
                }

                .img-action { height: 1.5em }


                .sets-btn {

                    position: realtive;
                    top:0;
                    background-color: grey;

                  
                }


                .speed-audio-info {
                    color:red;
                    padding-left: .3em;
                    font-size:.9em;
                }

                /* ---------------------------------------- */
                /* Slider Volume Bar  
                /* ---------------------------------------- */
                .volume-bar,
                .slider-vertical {

                    position:relative;
                    bottom:3em;
                    left: .2em;
                    transform: rotate(-90deg);

                }

           

                /* ---------------------------------------- */
                /* Slider Progress Bar  
                /* ---------------------------------------- */

                .progress-bar {
                
                   -webkit-appearance: none;

                   width:100%;
                   height:4px;
                   background-color:#c1c2c3;
                   border-radius:.6em;

                    cursor: pointer;

                   
                } 

                ::-webkit-slider-thumb {

                    -webkit-appearance: none;

                    height: 15px;
                    width: 15px;
                    background-color: #f50;
                    border-radius: 50%;
                    border: none;
                    transition: .2s ease-in-out;
                }
              
                ::-moz-range-thumb {

                    height: 15px;
                    width: 15px;
                    background-color: #f50;
                    border-radius: 50%;
                    border: none;
                    transition: .2s ease-in-out;
                }

               

              


                .fangen {
                
                    position: relative;
                    top:0;

                    width: 3em;
                    height:3em;

                    background-color: green;

                }
             
                .more-audio-options-container.active {
                
                    min-width: 150px;
                    max-height:200px;
                    opacity:1;

                }
                    
                .more-audio-options-container {

                    position:absolute;
                    right:-.5em;
                    bottom:-.4em;
                    
                    
                    max-height:0px;
                    opacity:0;
                    // min-width: 150px;
                    // max-height:200px;

                    overflow-y:scroll;

                    transition: all .4s ease;

                    display:grid;
                    

                    background-image: linear-gradient(to left, #BDBBBE 0%, #9D9EA3 100%), radial-gradient(88% 271%, rgba(255, 255, 255, 0.25) 0%, rgba(254, 254, 254, 0.25) 1%, rgba(0, 0, 0, 0.25) 100%), radial-gradient(50% 100%, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.30) 100%);
                    background-blend-mode: normal, lighten, soft-light;


                    border-radius: .4em;

                    


                }

                .more-audio-options-container > label {

                    border-bottom: 1px solid #CBCBCB; 

                }

                input:checked + label { 

                    background-color:grey;
                }

                .more-audio-options-container > label:last-child {
                    border-bottom: 0px; 
                }

                .more-audio-options-container > input { display:none; }
                
                .more-audio-options-container > label {

                    height: 3em;
                    padding: 0em .6em;

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    font-weight:bold;

                    cursor:pointer;

                }

                .audio-download {

                    border-radius: .3em .3em 0em 0em;                    

                    height: 3em;
                    padding: 0em .6em;
                
                    display:flex;
                    align-items:center;
                    justify-content:center;

                    font-weight:bold;

                    color:#F7F7F7;

                    background-image: linear-gradient(to right, #434343 0%, black 100%);
                   

                
                }

             


               

                /* ---------------------------------------- */
                /* Slider Audio ( + Firefox Fix )
                /* ---------------------------------------- */

                /* ---------------------------------------- */
                /* Download Panel
                /* ---------------------------------------- */

                /* ---------------------------------------- */
                /* Audio Speed Panel
                /* ---------------------------------------- */

               

            </style>
            `;

        }

        /* ----------------------------------------------------- */
        /* render 
        /* ----------------------------------------------------- */
        render() {

            this.shadowRoot.innerHTML = `
            ${this.style()}

            <figure class="audio-player">

                <figcaption class="audio-name" style="display:none;"></figcaption>

                <audio></audio>

                <!-- ------------------------------------------------------- -->
                <!-- Button - Play / Stop -->
                <!-- ------------------------------------------------------- -->
                <button class="pause-btn" type="button">

                    <img src="cross.png" class="img-action" alt="img">

                </button>

                <div class="progress-indicator">
                    <span class="current-time">0:00</span>
                    <span> / </span>
                    <span class="duration">0:00</span>
                    <span class="speed-audio-info">x</span>
                    <input type="range" max="100" value="0" class="progress-bar">
                </div>


                <!-- ------------------------------------------------------- -->
                <!-- Speed Selection -->
                <!-- ------------------------------------------------------- -->
                <button class="sets-btn">

                   
                    <!-- ------------------------------------------------------- -->
                    <!-- Volume Bar -->
                    <!-- ------------------------------------------------------- -->
                    <div class="volume-bar slider-vertical">
                        <input type="range" min="0" max="2" step="0.01" value="${this.volume}" class="volume-field">
                    </div>

                </button>

                <!-- ------------------------------------------------------- -->
                <!-- Download Selection -->
                <!-- ------------------------------------------------------- -->
                <button class="sets-btn" id="more-options-btn">
                
                    <img src="" alt="img">

                    <div class="fangen">

                        <!-- ------------------------------------------ -->
                        <!-- More Options -->
                        <!-- ------------------------------------------ -->
                        <div class="more-audio-options-container">


                            <div class="audio-download">
                                Download
                            </div>

                            <input id="speed-0-5" type="radio" name="audio-speed" value="x 0,50">
                            <label for="speed-0-5">
                            x 0,50 
                            </label>

                            <input id="speed-0-75" type="radio" name="audio-speed" value="x 0,75">
                            <label for="speed-0-75">
                                x 0,75 
                            </label>

                            <input checked id="speed-1" type="radio" name="audio-speed" value="">
                            <label for="speed-1">
                                Normal ( x 1 )
                            </label>

                            <input id="speed-1-25" type="radio" name="audio-speed" value="x 1,25">
                            <label for="speed-1-25">
                                x 1,25 
                            </label>

                            <input id="speed-1-50" type="radio" name="audio-speed" value="x 1,50">
                            <label for="speed-1-50">
                                x 1,50 
                            </label>

                            <input id="speed-1-75" type="radio" name="audio-speed" value="x 1,75">
                            <label for="speed-1-75">
                                x 1,75 
                            </label>

                            <input id="speed-2" type="radio" name="audio-speed" value="x 2,0">
                            <label for="speed-2">
                                x 2,0 
                            </label>

                        </div>

                    </div>

                </button>

                
            </figure>

            `;

            this.audio = this.shadowRoot.querySelector('audio');
            this.playPauseBtn = this.shadowRoot.querySelector('.pause-btn')
            this.titleElement = this.shadowRoot.querySelector('.audio-name');
            this.volumeBar = this.shadowRoot.querySelector('.volume-field')
            
           // <button class="download-btn">
                        //     Download
                        // </button>
            // new 
            // this.downloadAudio = this.shadowRoot.querySelector(".download-audio-btn");
            // this.speedAudio = this.shadowRoot.querySelector(".speed-audio-btn");

            this.progressIndicator = this.shadowRoot.querySelector('.progress-indicator');
            this.currentTimeEl = this.progressIndicator.querySelector('.current-time')
            this.durationEl = this.progressIndicator.querySelector('.duration')
            this.progressBar = this.progressIndicator.querySelector('.progress-bar')

            this.moreAudioOptionsBtn = this.shadowRoot.getElementById("more-options-btn");
            this.moreAudioOptionContainer = this.shadowRoot.querySelector(".more-audio-options-container");
            
            this.speedInputs = this.shadowRoot.querySelectorAll("input[name='audio-speed']");
            this.speedLabels = this.shadowRoot.querySelectorAll(".more-audio-options-container > label")
            this.speedAudioInfo = this.shadowRoot.querySelector(".speed-audio-info");

            // get Attribute 
            this.titleElement.textContent = this.attributes.getNamedItem('src')
            ? this.attributes.getNamedItem('title').value ?? 'untitled'
            : 'No Audio Source Provided';

            // if rendering or re-rendering all audio attributes need to be reset
            for (let i = 0; i < this.attributes.length; i++) {
                const attr = this.attributes[i];
                this.updateAudioAttributes(attr.name, attr.value);
            }
            
            this.attachEvents();

            

           
         

        }
       
    }

    // create own html tag 
    customElements.define( 'audio-player' , AudioPlayer )
}