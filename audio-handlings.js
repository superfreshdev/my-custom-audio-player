console.log("### audio-handlings.js ###")

/* ------------------------------------------------------- */
/* Define
/* ------------------------------------------------------- */

    // audio folder 
    const strAudioFolder = 'media/';

    // default Audio Index 
    var defaultAudioIndex = 0;

    // audio files 
    const strAudioFiles = [

        'case.mp3',
        '13-c-a-r-d-w.ogg',
        'DSharp - Heartless (Violin Cover) _ The Weeknd.mp3',
        'SHAMAN - ЛЮБИМАЯ ЖЕНЩИНА.mp3',
        'SHAMAN - ТЫ МОЯ.mp3',
        'blamless.mp3',
        'crazy-pop-violine.mp3',
        'Charlie Simpson - I See You (Official Video).mp3',
        'modernlove. - Dont Feel Myself (Official Music Video).mp3',
        'modernlove. - Only Ever Only You (Official Music Video).mp3',
        'modernlove. - Plans (Official Music Video).mp3',
    ]

    const strAudioTitles = [

        'Case Vannön - In the Morning',
        'Kap. 13 - Cafe am Rande der Welt ',
        'Violine - DSharp - Heartless - The Weeknd',
        'SHAMAN - ЛЮБИМАЯ ЖЕНЩИНА',
        'SHAMAN - ТЫ МОЯ',
        'Charlie Simpson - Blamless',
        'Violine - Crazy Pop South Korea Style',
        'Charlie Simpson - I See You',
        'modernlove. - Dont Feel Myself',
        'modernlove. - Only Ever Only You',
        'modernlove. - Plans',
    ]

    // Custom Audio Player
    const cAudioPlayer = document.getElementById('custom-audio-player-books');

    // Inputs - Audio General Sets 
    const ichkRepeat = document.getElementById('chk-repeat-audio')
    const ichkAudioplay = document.getElementById('chk-autoplay-audio')
    const ichkInfinity = document.getElementById('chk-infinity-audio')

    // Audio Current / Max Index , Prev/Next Button 
    const currentAudioIndex = document.getElementById('js-currentAudioIndex'); 
    const maxAudioIndex = document.getElementById('js-maxAudioIndex'); 

    const btnAudioPrev = document.getElementById('btn-audio-prev');
    const btnAudioNext = document.getElementById('btn-audio-next');
    
    

/* ------------------------------------------------------- */
/* Execute ( Action ) 
/* ------------------------------------------------------- */

// cAudioPlayer.setAttribute( "src" , "media/case.mp3" )
// cAudioPlayer.setAttribute( "title" , "Case Vannön - In the Morning" )

// cAudioPlayer.setAttribute( "src" , "media/crazy-pop-violine.mp3" )
// cAudioPlayer.setAttribute( "title" , "Violine - Crazy Pop South Korea Style" )


/* -------------------------------------------------------- */
/* Setting Sources - Custom Audio Player 
/* -------------------------------------------------------- */

console.log(" --- " + strAudioTitles[0] )

// Set Current Audio Track 
currentAudioIndex.innerText =  getZeroToOneIndex( defaultAudioIndex ).toString().padStart(2,'0');

// Set Max Audio Tracks 
maxAudioIndex.innerText = strAudioFiles.length.toString().padStart(2,'0');

// set default audio src & title 
setAudioSrcAndTitle( cAudioPlayer , ( strAudioFolder + strAudioFiles[ defaultAudioIndex ] ) , strAudioTitles[0] )




/* -------------------------------------------------------- */
/* Click Listener - Prev & Next Buttons
/* -------------------------------------------------------- */

btnAudioPrev.addEventListener( 'click' , ()=> {

    console.log(" Prev (-1)")

    if( ( getAudioIndex() - 1 ) != -1 ) {

        console.log("[Prev]Vorher Index = " + defaultAudioIndex )
        setAudioIndex( -1 )
        console.log("[Prev]Nachher Index = " + defaultAudioIndex )

        currentAudioIndex.innerText = (defaultAudioIndex+1).toString().padStart(2,'0');
        
        setAudioSrcAndTitle( cAudioPlayer , ( strAudioFolder + strAudioFiles[ defaultAudioIndex ] ) , strAudioTitles[ defaultAudioIndex ] )

        cAudioPlayer.setAttribute("autoplay", "");

    } 

    

})

btnAudioNext.addEventListener( 'click' , ()=> {

    console.log(" Next  (+1)")
    

    if( ( getAudioIndex() +1 ) < strAudioFiles.length ) {

        console.log("[Next]Vorher Index = " + defaultAudioIndex )
        setAudioIndex( 1 )
        console.log("[Next]Nachher Index = " + defaultAudioIndex )

        currentAudioIndex.innerText = (defaultAudioIndex+1).toString().padStart(2,'0');

        setAudioSrcAndTitle( cAudioPlayer , ( strAudioFolder + strAudioFiles[ defaultAudioIndex ] ) , strAudioTitles[ defaultAudioIndex ] )

        console.log("Next Next --- " + cAudioPlayer.getAttribute("src") )

        cAudioPlayer.setAttribute("autoplay" , "");

       
    } 

})

/* -------------------------------------------------------- */
/* Change Listener - General Audio Sets 
/* -------------------------------------------------------- */

// ChangeListener - Repat
ichkRepeat.addEventListener( 'change' , ()=> {
    console.log( "ihkRepeat - trigger" )
    setOfRuleRepeat( ichkRepeat , ichkAudioplay , ichkInfinity );
} ) 

// ChangeListener - Autoplay
ichkAudioplay.addEventListener( 'change' , ()=> {
    console.log( "ichkAudoplay - trigger" )
    setOfRuleAutoplay( ichkRepeat , ichkAudioplay );
} ) 

// ChangeListener - Infinity 
ichkInfinity.addEventListener( 'change' , ()=> {
    console.log( "ichkInfinity - trigger" )
    setOfRuleInfinity( ichkRepeat , ichkAudioplay , ichkInfinity );
} ) 


/* ------------------------------------------------------- */
/* Functions 
/* ------------------------------------------------------- */

// Condition 1: Repeat is checked , nothing other allowed 
// Condition 2: Infinity(A) is checked , automically autoplay will checked 
// Condition 3: Audoplay is checked , uncheck repeat

function setOfRuleRepeat( ichkRepeat , ichkAudioplay , ichkInfinity) {

    if( ichkRepeat.checked == true ) {
        
        ichkAudioplay.checked = false;
        ichkInfinity.checked = false;

        cAudioPlayer.setAttribute("loop" , "");

    }

}

function setOfRuleAutoplay( ichkRepeat , ichkAudioplay ) {

    if( ichkAudioplay.checked == true ) {
        ichkRepeat.checked = false;
        cAudioPlayer.removeAttribute("loop")
    }

    // without audio play , infinity unset  
    if( ichkAudioplay.checked == false && ichkInfinity.checked == true ) {
        ichkInfinity.checked = false;
        cAudioPlayer.removeAttribute("loop")
    }

}

function setOfRuleInfinity( ichkRepeat , ichkAudioplay , ichkInfinity) {

    // unset reapeat
    if( ichkRepeat.checked == true && ichkInfinity.checked == true ) {
        ichkRepeat.checked = false;
        cAudioPlayer.removeAttribute("loop")
    }

    // Infinity only work with autoplay
    if( ichkAudioplay.checked == false && ichkInfinity.checked == true ) {
        ichkAudioplay.checked = true;
        cAudioPlayer.removeAttribute("loop")
    }



}


// set Audio Src & Title 

function setAudioSrcAndTitle( audio , strSrc , strTitle ) {

    console.log( "[setAudioSrcAndTitle] = " + strSrc )
    console.log( "[setAudioSrcAndTitle] = " + audio.getAttribute( "src" ) )

    audio.setAttribute( "src" , strSrc );

    audio.setAttribute( "title" , strTitle );

}

// get actually audio playing file -> index 


/* ------------------------------------- */
/* Next & Prev Audio
/* ------------------------------------- */


function getAudioIndex() {
    return defaultAudioIndex;
}

function setAudioIndex( step ) {

    switch( step ){

        case 1:
            return defaultAudioIndex++;
            
            
        case -1:
            return defaultAudioIndex--;
            
            
        // default:
        //     console.log("[Error] - Wrong Number Step by Switching Audio File")

    }

   
}

function getZeroToOneIndex( zeroIndex ) {

    if( zeroIndex == 0 ) {
        return zeroIndex=1;
    } 

    return zeroIndex;
}















/* --------------------------------------------- */
/* Testing Trash 
/* --------------------------------------------- */


// console.log( 'cAudioPlayer = ' + cAudioPlayer.getAttribute( 'title' ) )
// console.log( 'cAudioPlayer = ' + cAudioPlayer.getAttribute( 'src' ) )

// console.log( "Concat = " + strAudioFolder+strAudioFiles[0] )
// console.log( "Concat = " + strAudioTitles[0] )

// var audiofile = strAudioFolder + strAudioFiles[0];
// console.log( "Concat = " + audiofile )