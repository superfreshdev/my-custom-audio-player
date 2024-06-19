{
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate

  

    class AudioPlayer extends HTMLElement {

        playing = false;
        currentTime = 0;
        duration = 0;
        volume = 0.4;

        nonAudioAttributes = new Set(['title', 'bar-width', 'bar-gap', 'buffer-percentage']);
        
        initialized = false;

        /* ----------------------------------------------------- */
        /* Constructor
        /* ----------------------------------------------------- */
        constructor() {

            super();

            // open mode - allow to see the content on the tag in the browser  
            this.attachShadow( {mode: 'open'});
            this.render();

            this.initializeAudio();
            this.attachEvents();

        }

        /* ----------------------------------------------------- */
        /* Get | Attribute from Custom HTML Tempate
        /* ----------------------------------------------------- */
        static get observerAttributes() {
            return ['src', 'title', 'muted', 'crossorigin' , 'loop' , 'preload' ]
        }

        /* ----------------------------------------------------- */
        /* Get |  Attribute from HTML
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
        /* Get |Attribute from HTML
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


            /* ----------------------------------------------------------------------------- */
            /* loadedmetadata | Event to load asyn in real time data from audio 
            /* ----------------------------------------------------------------------------- */
            this.audio.addEventListener( 'loadedmetadata' , ()=> {

                /* -------------------------------------------------------- */
                /* Set Audio Source for Download ( only work if its on the server , because of origin browser blocked )
                /* if u like i without server u should build own funciton blob ... async
                /* -------------------------------------------------------- */
                this.linkDownloadAudio.setAttribute( "href" , this.audio.getAttribute("src") )

                /* -------------------------------------------- */
                /* Set Duration & Current Time 
                /* -------------------------------------------- */
                this.progressBar.max = this.audio.duration;
                this.durationEl.textContent = this.getTimeString(this.audio.duration);
                this.updateAudioTime();

                /* -------------------------------------------- */
                /* Set Audio Speed ( default ) 
                /* -------------------------------------------- */
                this.setAudioSpeed( this.getCheckedRadioIndex( ) );


            })

            /* -------------------------------------------------------- */
            /* Click | Play / Pause - Button
            /* -------------------------------------------------------- */
            this.playPauseBtn.addEventListener( 'click' , this.togglePlay.bind(this), false )
        
         
            /* -------------------------------------------------------- */
            /* Input | Progress Bar ( update jumping audio time  )
            /* -------------------------------------------------------- */
            this.progressBar.addEventListener( 'input' , ()=> {

                this.seekTo( this.progressBar.value );
            })

            /* -------------------------------------------------------- */
            /* timeupdate | Event to update current time 
            /* -------------------------------------------------------- */
            this.audio.addEventListener( 'timeupdate', ()=> {
                this.updateAudioTime(this.audio.currentTime);
            }) 



           




            /* -------------------------------------------------------- */
            /* ended | Event to handle end of audio
            /* -------------------------------------------------------- */
            this.audio.addEventListener( 'ended', ()=> {
        
                this.playing = false;
                
                // change img src of button 
                this.playPauseBtn.querySelector("img").setAttribute("src", "media/play-taste.png" )
               
                // change button bg-color 
                this.playPauseBtn.classList.remove('play-btn');
                this.playPauseBtn.classList.add('pause-btn');

            }, false )

            /* -------------------------------------------------------- */
            /* pause | Event to handle pause of audio
            /* -------------------------------------------------------- */
            this.audio.addEventListener('pause', () => {

                this.playing = false;
               
                // change img src of button 
                this.playPauseBtn.querySelector("img").setAttribute("src", "media/play-taste.png" )


                // change button bg-color 
                this.playPauseBtn.classList.remove('play-btn');
                this.playPauseBtn.classList.add('pause-btn');

              }, false);
            
            /* -------------------------------------------------------- */
            /* play | Event to handle play of audio
            /* -------------------------------------------------------- */
            this.audio.addEventListener('play', () => {

                this.playing = true;
                
                // change img src of button 
                this.playPauseBtn.querySelector("img").setAttribute("src", "media/pause.png" )

                // change button bg-color 
                this.playPauseBtn.classList.remove('pause-btn');
                this.playPauseBtn.classList.add('play-btn');

            }, false);


            /* -------------------------------------------------------- */
            /* Click | Volume Button 
            /* -------------------------------------------------------- */
            this.volumeBtn.addEventListener( 'click' , ()=> {

                this.volumeBarContainer.style.display = "flex";
                
                // this.volumeBtn.querySelector("img").style.display = "none";

            })

            /* -------------------------------------------------------- */
            /* MouseLeve | Volume Bar 
            /* -------------------------------------------------------- */
            this.volumeBtn.addEventListener( 'mouseleave' , ()=> {

                this.volumeBarContainer.style.display = "none";

                // this.volumeBtn.querySelector("img").style.display = "block";
            
            })

            /* -------------------------------------------------------- */
            /* Input | Volume Bar ( to handle clicked value )
            /* -------------------------------------------------------- */
            this.volumeBar.addEventListener( 'input' , this.changeVolume.bind(this), false )
       
            /* -------------------------------------------------------- */
            /* Click | More Audio Options - Button 
            /* -------------------------------------------------------- */
            this.btnMoreAudioOptions.addEventListener( 'click' , ()=> {


                console.log(" btnMoreAudioOptions =  clicked" )

                this.moreAudioOptionContainer.classList.add("active");

                this.addLabelClickListeners()
            })

            /* -------------------------------------------------------- */
            /* Focusout | More Audio Options - Button
            /* -------------------------------------------------------- */
            this.btnMoreAudioOptions.addEventListener( 'focusout' , ()=> {

                console.log(" btnMoreAudioOptions =  loose focus" )
                this.moreAudioOptionContainer.classList.remove("active");

            })


           
           
        }







        /* ------------------------------------------------------------------- */
        /* Help Functions 
        /* ------------------------------------------------------------------- */

        /* ----------------------------------------------------- */
        /* Update Attribute Ressource  
        /* ----------------------------------------------------- */
        updateAttributeRessource( domElement , strAttribute ) {

            // at least focus on button + img ( src, class )
            if(domElement == 'button') {

                console.log("Is Button Baby" + domElement )
            }


        }

        /* ----------------------------------------------------- */
        /* Get Checked Radio Index 
        /* ----------------------------------------------------- */
        getCheckedRadioIndex( ) {

            for( let i=0; i < this.speedInputs.length; i++ ) {

                if( this.speedInputs[i].checked == true ) {
                    return i;
                }
            }
            
            return -1;
        }

        /* ----------------------------------------------------- */
        /* Set - Audio Speed
        /* ----------------------------------------------------- */
        setAudioSpeed( index ) {

        //    console.log( "[setAudioSpeed] Index clicked = " +  index )

           /* ------------------------------------------------------ */
           /* Set & Update View 
           /* ------------------------------------------------------ */
           this.speedInputs[ index ].checked = true;

          // unshown normal speed 
          if( this.speedInputs[ index ].getAttribute("value") === "1.0" ) {

            // delete show speed info if its was before
            if( this.speedAudioInfo.classList.contains("show-speed-info") ) {
                this.speedAudioInfo.classList.remove("show-speed-info");
            }
            // set empty for unshown
            this.speedAudioInfo.innerText = "";
            this.setPlaybackRate(1.0);

          } else {

            // add if hadnt class name , if u switch other than default it 
            // dont must set again 
            if( !this.speedAudioInfo.classList.contains("show-speed-info") ) {
                this.speedAudioInfo.classList.add("show-speed-info");
            }
           
            this.speedAudioInfo.innerText = "x " + this.speedInputs[ index ].getAttribute("value");

            // Warning - Value must be 1.0 , 1.25 on this way 
            this.setPlaybackRate( parseFloat( this.speedInputs[ index ].getAttribute("value") ) );
          }

           
 
        }

        /* ----------------------------------------------------- */
        /* Set Playback Rate 
        /* ----------------------------------------------------- */
        setPlaybackRate( rate ) {
            
            // console.log("[setPlaybackRate] = " + rate )
            this.audio.playbackRate = rate;

        }

      
        /* ----------------------------------------------------- */
        /* Update Label Click
        /* ----------------------------------------------------- */
        addLabelClickListeners() {

            for( let i=0; i < this.speedLabels.length; i++ ) {

                this.speedLabels[i].addEventListener( "click" , ()=> {

                    /* ------------------------------------------ */
                    /* Set - Audio Speed 
                    /* ------------------------------------------ */
                    this.setAudioSpeed( i )
 
                })

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
      
            // console.log("volume===" + this.volume)
           
            // if (Number(this.volume) > 1) {
            //     this.volumeBar.parentNode.className = 'volume-bar over';
            // } else if (Number(this.volume) > 0) {
            //     this.volumeBar.parentNode.className = 'volume-bar half';
            // } else {
            //     this.volumeBar.parentNode.className = 'volume-bar';
            // }
            
            if (this.gainNode) {
                this.gainNode.gain.value = this.volume;
                this.volumeValueInfo.innerText = Math.round(Number( this.volumeBar.value * 100)) + " %";

                // Update Volume Icon View 
                if( Math.round(Number( this.volumeBar.value * 100)) == 0 ) {

                    // bigger mute speaker 
                    this.imgVolume.setAttribute( "src" , "media/volume-mute.png" )
                    this.imgVolume.style.height = "1.3em";

                    /*padding-top: 0, 4px , rog-gap .3em 0em*/
                    this.btnViewVolumeContainer.style.paddingTop = "0px";
                    this.btnViewVolumeContainer.style.rowGap = "0em";
                    this.volumeValueInfoSmall.style.display = "none";

                } else {


                    // btn view volume container 
                    this.btnViewVolumeContainer.style.paddingTop = "4px";
                    this.btnViewVolumeContainer.style.rowGap = ".3em";
                    
                    // smaller speaker 
                    this.imgVolume.setAttribute( "src" , "media/volumen.png" )
                    this.imgVolume.style.height = "1em";

                    // show mini volume % info
                    this.volumeValueInfoSmall.style.display = "block";
                    this.volumeValueInfoSmall.innerText = Math.round(Number( this.volumeBar.value * 100)) + "%";

                   
                }
                

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
        /* Update Audio Time  , time 
        /* ----------------------------------------------------- */
        updateAudioTime() {
            this.progressBar.value = this.audio.currentTime;
            this.currentTimeEl.textContent = this.getTimeString(this.audio.currentTime);
        }

       
        style() {
            return `
            <style>


                /* ---------------------------------------------------------------------- */
                /* Default Styles for Buttons  
                /* ---------------------------------------------------------------------- */

                .def-btn-audio {

                    position: relative;
                    top:0;

                    appearance : none;
                    border:none;
                    outline:none;

                    border-radius: .4em;

                    min-width: 42px;
                    min-height: 42px;

                    max-width: 42px;
                    max-height: 42px;

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

                .img-action { height: 1.3em }


                .sets-btn {

                    background-color: #E6E6E6;

                }


                .audio-handling-container {

                    padding-bottom: 1em;

                    display:flex;
                    align-items:center;
                    justify-content: flex-end;
                    column-gap: .4em;
                }

                .btn-audio-handling {

                    height: 2em;

                    padding: 0em .8em;

                    display:flex;
                    align-items:center;
                    column-gap: .3em;

                    border-radius: .4em;

                    background-color:#E6E6E6;
                }

              

                /* ---------------------------------------------------------------------- */
                /* Audio Player 
                /* ---------------------------------------------------------------------- */

                .audio-player {

                    position:relative;
                    top:0;

                    padding: .8em .6em;

                    display:grid;
                    grid: 1fr auto / 1fr;
                    
                   
                    background-color: #f1f3f4;

                    border-radius: .4em;
                    
                }

                /* ------------------------------------------------------------- */
                /*  Audio Title Container 
                /* ------------------------------------------------------------- */

                .audio-title-container {

                    display:flex;
                    
                }

                input.audio-name {

                    /* Deleting default input text styles */
                    border: 0px;

                    height: 2em;
                    padding: 1px .8em 0em .3em;
                    margin-bottom: .4em;

                    width:100%;

                    
                    color:#707070;
                    background-color: #f1f3f4;
                    /*background-color: #f1f3f4;
                    background-color:red;
                    background-color: #FF8E8E;
                    background-color:#E6E6E6;
                    background-color:#F0F0F0;
                    background-color: #CDCDCD;*/


                    border-radius: .4em;

                    /*cursor:grab;*/
                }
                                
                /* ------------------------------------------------------------- */
                /*  Audio Container 
                /* ------------------------------------------------------------- */

                .audio-container {

                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    column-gap:.6em;

                }

                /* ------------------------------------------------------------- */
                /* Info Audio Container 
                /* ------------------------------------------------------------- */

                .info-audio-container {

                    width:100%;

                    display:flex;
                    align-items:center;
                   
                    column-gap: .6em;
                }

                /* ---------------------------------------- */
                /* Progress Indicator 
                /* ---------------------------------------- */

                .progress-indicator {

                    width:100%;

                    display:grid;
                    row-gap:.6em;
                }

                /* ---------------------------------------- */
                /* Info Progress Bar  
                /* ---------------------------------------- */

                .info-progress-bar {

                    font-size: .9em;

                    padding-left:3px;

                    display:flex;
                    align-items:center;
                    column-gap: .3em;
                }

                .duration { font-weight:bold; }

                .speed-info {

                    height: 1.3em;
                    padding: 0em .2em;
                    margin-bottom: 2px;
                    margin-left: 4px;

                    display:flex;
                    align-items:center;
                    justify-content:center;
 
                    border-radius:.2em;
                
                }

                .show-speed-info {

                    color: #404040;
                    background-color: #DEDEDE;

                }

                /* ---------------------------------------- */
                /*  Progress Bar  
                /* ---------------------------------------- */

                .progress-bar {
                
                   -webkit-appearance: none;

                   width:100%;
                   height:4px;
                   background-color:#c1c2c3;

                   border-radius:.6em;

                    cursor: pointer;

                } 

                input[type=range]:focus::-webkit-slider-runnable-track {
                    background: #c1c2c3;
                    border-radius:.6em;
                }

                /* --------------------------------------- */
                /* Thumb - Progresbar 
                /* --------------------------------------- */

                ::-webkit-slider-thumb {

                    -webkit-appearance: none;
                     

                    height: 15px;
                    width: 15px;
                    background-color: #404040;
                    border-radius: 50%;
                    border: none;
                    transition: .2s ease-in-out;
                }
              
                ::-moz-range-thumb {

                    height: 15px;
                    width: 15px;
                    background-color: #404040;
                    border-radius: 50%;
                    border: none;
                    transition: .2s ease-in-out;
                }

              



                /* ------------------------------------------------------------- */
                /* Sets Audio Container 
                /* ------------------------------------------------------------- */

                .sets-audio-container {

                    display:flex;
                    align-items:center;
                    column-gap: .3em;
                }

                /* ---------------------------------------- */
                /* Button - View Volume Container  
                /* ---------------------------------------- */

                .btn-view-volume-container {

                    padding-top:4px;
                    display: grid;
                    justify-items:center;
                    row-gap: .3em;
                }

                /* ---------------------------------------- */
                /* Volume Icon of Button  
                /* ---------------------------------------- */

                .imgVolume {

                    height: 1em;
                    /*height: 1.3em; */
                    padding-left: 2px;
                }

                .btn-volume-value-info {

                    font-size: .8em;
                    padding-left:1px;
                }

                /* ---------------------------------------- */
                /* Volume Bar Container   
                /* ---------------------------------------- */

                .volume-bar-container {

                    position:absolute;
                    bottom:0;
                    right:0;

                    padding: 0em .8em;
                    
                    height: 42px;
                   
                    display:flex;
                    column-gap: 1em;
                    align-items:center;
                    justify-content:flex-end;

                    border-radius: .4em;
                    background-color: #787878;

                    display:none;

                }

                .volume-value-info {

                    font-size: 16px;
                    font-weight:bold;


                    min-width: 3.8em;
                    max-width: 3.8em;
                    padding: .3em .3em;

                    color: #f1f3f4;
                    background-color:#404040;
                    border-radius: .4em;

                }

                /* ---------------------------------------- */
                /* Volume Bar  
                /* ---------------------------------------- */

                .volume-bar {
                
                    appearance: none;

                    width: 80px;
                    height:10px;

                    background-color:#c1c2c3;
                    border-radius:.6em;

                    cursor: pointer;

                    /* display: none;  transform: rotate(-90deg);*/

                } 

                /*.volume-bar::-webkit-slider-thumb {

                    height: 25px;
                    width: 25px;
                    background-color: #f50;
                    border-radius: 50%;
                    border: none;
                    transition: .2s ease-in-out;
                }
              
                .volume-bar::-moz-range-thumb {

                    height: 15px;
                    width: 15px;
                    background-color: #f50;
                    border-radius: 50%;
                    border: none;
                    transition: .2s ease-in-out;
                } */

               

                /* ------------------------------------------------------------- */
                /* Button - More Option Container 
                /* ------------------------------------------------------------- */

                #btn-more-audio-options > img:nth-of-type(1) {

                    height: 1.3em;
                    width: 1.3em;
                }
              
                /* ------------------------------------------------------------- */
                /* More Audio Options Container 
                /* ------------------------------------------------------------- */

                .more-audio-options-container {

                    font-size: 16px;

                    min-width: 0px;
                    max-height: 0px;
                    opacity:0;
                   
                    overflow-y:scroll;

                    position:absolute;
                    right:0;
                    bottom: 0em;

                    min-width: 10em;

                    background-image: linear-gradient(to left, #BDBBBE 0%, #9D9EA3 100%), radial-gradient(88% 271%, rgba(255, 255, 255, 0.25) 0%, rgba(254, 254, 254, 0.25) 1%, rgba(0, 0, 0, 0.25) 100%), radial-gradient(50% 100%, rgba(255, 255, 255, 0.30) 0%, rgba(0, 0, 0, 0.30) 100%);
                    background-blend-mode: normal, lighten, soft-light;

                    border-radius: .4em;

                }

                
                /* if open mode view container */
                .more-audio-options-container.active {
                
                    min-width: 150px;
                    max-height:200px;
                    opacity:1;

                }

                /* ---------------------------------------------- */
                /* Custom Scrollbar Style ( Chrome , Firefox )  
                /* ---------------------------------------------- */

                .more-audio-options-container::-webkit-scrollbar {

                    width: .4em;

                    background-color: #D1D1D1;
                
                    border-radius: 0 .4em .4em 0;
                }

                .more-audio-options-container::-webkit-scrollbar-thumb {

                    background-color: #363636;
                    
                    border-radius: .1em .4em .4em 0;
                }

   
                /* ---------------------------------------------- */
                /* Download Audio - Div Button 
                /* ---------------------------------------------- */
                
                .download-audio-link {

                    height: 2.6em;
                    padding: 0em .8em;

                    text-decoration:none;

                    display:flex;
                    align-items:center;
                    justify-content:center;
                    column-gap: .6em;

                    font-weight:bold;

                    border-radius: .4em 0em 0em 0em;

                    color:white;
                    background-color: #363636;

                    cursor: pointer;

                    transition: .4s all ease;
                }

                .download-audio-link:hover { 
                    background-color:#767676;   
                }

                .download-audio-link > img {

                    height: .8em;
                    width: .9em;
                }

               
                /* ---------------------------------------------- */
                /* Speed Audio Labels & Input  
                /* ---------------------------------------------- */

                .more-audio-options-container > input { 
                    display: none;
                }

                .more-audio-options-container > input:checked + label {
                    background-color:grey;
                }

                .more-audio-options-container > label {

                    height: 2.8em;
                    padding: 0em .6em;

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    font-weight:bold;

                    cursor:pointer;

                    border-bottom: 1px solid #CBCBCB; 

                }

                .more-audio-options-container > label:last-child {

                    border-bottom: 0px; 
                }

                .more-audio-options-container > label:hover {

                    background-color:grey;
                }

              
            </style>
            `;

        }

       
        render() {

            
            this.shadowRoot.innerHTML = `
            ${this.style()}
            
                <!-- Depracted - better solution build own way with input -->
                <!-- 
                    <marquee class="audio-name" direction="left"
                    behavior="scroll"
                    scrollamount="3"
                    scrolldelay="1"
                    >
                </marquee>
                -->

            <div class="audio-handling-container">

                <label class="btn-audio-handling">
                    Repeat
                </label>

                <label class="btn-audio-handling">
                    Autoplay
                </label>

                <label class="btn-audio-handling">
                    Infinity(A)
                </label>

            </div>

            

 
            <div class="audio-player">

                <audio style="display:none;"></audio>

                <!-- ------------------------------------------------------- -->
                <!-- Audio Title Container  -->
                <!-- ------------------------------------------------------- -->
                <div class="audio-title-container">
                    <input type="text" class="audio-name" value="" readonly disabled> 
                </div>

                <!-- ------------------------------------------------------- -->
                <!-- Audio Container  -->
                <!-- ------------------------------------------------------- -->
                <div class="audio-container">


                    <!-- ------------------------------------------------------- -->
                    <!--  [1/2] - Info Audio Container -->
                    <!-- ------------------------------------------------------- -->

                    <div class="info-audio-container">
                
                        <!-- ------------------------------------------------------- -->
                        <!-- Button - Play/Stop -->
                        <!-- ------------------------------------------------------- -->

                        <button class="def-btn-audio pause-btn" type="button">
                            <img src="media/play-taste.png" class="img-action" alt="img">
                        </button>

                        <!-- ------------------------------------------------------- -->
                        <!-- Progress Indicator                                      -->
                        <!-- ------------------------------------------------------- -->

                        <div class="progress-indicator">

                            <div class="info-progress-bar">
                                <div class="current-time">0:00</div>
                                <div> / </div>
                                <div class="duration">0:00</div>
                                <div class="speed-info">-</div> 
                            </div>

                            <!-- ------------------------------------------------------- -->
                            <!-- Progress Bar ( input range )                            -->
                            <!-- ------------------------------------------------------- -->
                            <input class="progress-bar" type="range" max="100" value="0" >
                            
                        </div>

                    </div>

                    <!-- ------------------------------------------------------- -->
                    <!-- [2/2] - Sets Audio Container -->
                    <!-- ------------------------------------------------------- -->
                    
                    <div class="sets-audio-container">

                        <!-- ------------------------------------------------------- -->
                        <!-- Volume Bar - Button                                     -->
                        <!-- ------------------------------------------------------- -->

                        <button class="def-btn-audio sets-btn" id="volume-bar-btn">

                            <div class="btn-view-volume-container">
                                <img src="media/volumen.png" class="imgVolume" alt="img">
                                <div class="btn-volume-value-info">${this.volume*100}%</div>
                            </div>
                            

                            <div class="volume-bar-container">

                                <div class="volume-value-info">${this.volume*100} %</div>     
                                <input type="range" min="0" max="2" step="0.01" value="${this.volume}" class="volume-bar">   
                                 
                                
                            </div>

                        </button>

                    
                        <!-- ------------------------------------------ -->
                        <!-- More Audio Options - Button                -->
                        <!-- ------------------------------------------ -->
                        
                        <button class="def-btn-audio sets-btn" id="btn-more-audio-options">
                        
                            <img src="media/punkte.png" alt="img">

                            <!-- -------------------------------------------------------------- -->
                            <!-- Choose More Audio Options - List Container                     -->
                            <!-- -------------------------------------------------------------- -->
                            <div class="more-audio-options-container">

            
                                <!-- ------------------------------------------ -->
                                <!-- Download Audio - Button                    -->
                                <!-- ------------------------------------------ -->

                                <a href="" class="download-audio-link" download>

                                    <img src="media/download-icon.png" alt="img">
                                    <div>Download</div>
                            
                                </a>

                                <!-- ------------------------------------------ -->
                                <!-- Speed Audio Sets - Labels                  -->
                                <!-- ------------------------------------------ -->
                                <!-- radio-audio-speed -->

                                <input id="speed-0-5" type="radio" name="audio-speed" value="0.50">
                                <label for="speed-0-5"> x 0,50 </label>
                                
                                <input id="speed-0-75" type="radio" name="audio-speed" value="0.75">
                                <label for="speed-0-75">x 0,75 </label> 
                                    
                                <input checked id="speed-1" type="radio" name="audio-speed" value="1.0">
                                <label for="speed-1">
                                    Normal
                                </label>

                                <input id="speed-1-25" type="radio" name="audio-speed" value="1.25">
                                <label for="speed-1-25">
                                    x 1,25 
                                </label>

                                <input id="speed-1-50" type="radio" name="audio-speed" value="1.50">
                                <label for="speed-1-50">
                                    x 1,50 
                                </label>

                                <input id="speed-1-75" type="radio" name="audio-speed" value="1.75">
                                <label for="speed-1-75">
                                    x 1,75 
                                </label>

                                <input id="speed-2" type="radio" name="audio-speed" value="2.0">
                                <label for="speed-2">
                                    x 2,0 
                                </label>

                                <input id="speed-2-50" type="radio" name="audio-speed" value="2.50">
                                <label for="speed-2-50">
                                    x 2,50 
                                </label>

                                

                            </div>
                        </button>
                    </div>

                </div>
                
            </div>

            `;

            /* ------------------------------------------- */
            /* Audio Tag / File 
            /* ------------------------------------------- */

            this.audio = this.shadowRoot.querySelector('audio');

            this.audioTitleEl = this.shadowRoot.querySelector('.audio-title-container');
            this.titleElement = this.shadowRoot.querySelector('.audio-name');

            


            /* ------------------------------------------- */
            /* Play/Stop - Button
            /* ------------------------------------------- */

            this.playPauseBtn = this.shadowRoot.querySelector('.pause-btn')
            
          
            /* ------------------------------------------- */
            /* Progress Indicator & Progressbar
            /* ------------------------------------------- */

            this.progressIndicator = this.shadowRoot.querySelector('.progress-indicator');
            this.progressBar = this.progressIndicator.querySelector('.progress-bar')

            /* ------------------------------------------- */
            /* Audio Text Infos 
            /* ------------------------------------------- */

            this.currentTimeEl = this.progressIndicator.querySelector('.current-time')
            this.durationEl = this.progressIndicator.querySelector('.duration')

            this.speedAudioInfo = this.shadowRoot.querySelector(".speed-info");

            /* ------------------------------------------- */
            /* Volume - Button & Volume Bar 
            /* ------------------------------------------- */

            this.volumeBtn = this.shadowRoot.getElementById('volume-bar-btn');

            this.btnViewVolumeContainer = this.shadowRoot.querySelector('.btn-view-volume-container')
            this.imgVolume = this.shadowRoot.querySelector('.imgVolume')
            this.volumeValueInfoSmall = this.shadowRoot.querySelector('.btn-volume-value-info')

            this.volumeBarContainer = this.shadowRoot.querySelector('.volume-bar-container');
           
            this.volumeValueInfo = this.shadowRoot.querySelector('.volume-value-info')
            this.volumeBar = this.shadowRoot.querySelector('.volume-bar')
           
            
            /* ------------------------------------------- */
            /* More Option Audio 
            /* ------------------------------------------- */

            /* View Container */
            this.btnMoreAudioOptions = this.shadowRoot.getElementById("btn-more-audio-options");
            this.moreAudioOptionContainer = this.shadowRoot.querySelector(".more-audio-options-container");

            /* Downlod Audio Div ( Button ) */
            this.linkDownloadAudio = this.shadowRoot.querySelector(".download-audio-link");

            /* Speed Inputs & Labels */
            this.speedInputs = this.shadowRoot.querySelectorAll("input[name='audio-speed']");
            this.speedLabels = this.shadowRoot.querySelectorAll(".more-audio-options-container > label")
            
           

            /* ------------------------------------------- */
            /* Get Defined Attributes 
            /* ------------------------------------------- */

            if(  this.attributes.getNamedItem('src') != null ) {

                this.titleElement.value = this.attributes.getNamedItem('src')

                if( this.attributes.getNamedItem('title') != null ) {

                    this.titleElement.value = this.attributes.getNamedItem('title').value;
                    
                } else {
                    
                    this.audioTitleEl.style.display = "none";
                } 

            } else {

                console.log( "No Audio Sorce Provided" )
            }

           
            
           


            /*else {

                this.titleElement.value = this.attributes.getNamedItem('src')
                ? this.attributes.getNamedItem('title').value ?? 'untitled'
                : 'No Audio Source Provided';

            } */

          

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