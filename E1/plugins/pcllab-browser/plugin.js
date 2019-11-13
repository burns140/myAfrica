/**
 * @name PCLLAB Browser
 * 
 * Get browser info and block specific browsers and mobile devices
 * Written in ES5 to support older browsers
 * 
 * @param {array} blocked_browsers - An array of strings containing blocked browsers
 * Possibilities include IE, Firefox, Chrome, Opera, Safari, Mobile Safari, default ['IE']
 * @param {boolean} allow_mobile - Allow mobile devices, false by default
 * @param {string} block_title - Title to show if client is blocked, default "Unsupported Browser"
 * @param {string} block_text - Description text to show if client is blocked
 *  
 * @author Andrew Arpasi
 */
jsPsych.plugins['pcllab-browser'] = ( function() {
    var plugin = {}
    plugin.trial = function(display_element, trial) {
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial)
      var clientJS = new ClientJS();

      trial.blocked_browsers = trial.blocked_browsers || ['IE'];
      trial.allow_mobile = trial.allow_mobile || false;
      trial.block_title = trial.block_title || 'Unsupported Browser';
      trial.block_text = trial.block_text || 'Your current browser/device is not supported by this experiment.';

      var titleView = $('<h2>', {
        class: 'pcllab-text-center pcllab-default-bottom-margin-medium',
        text: trial.block_title
      });  

      var textView = $('<p>',{
        class: 'pcllab-text-center',
        text: trial.block_text
      });

      var browser = clientJS.getBrowser();

      if(trial.blocked_browsers.includes(browser) || (clientJS.isMobile() && !trial.allow_mobile)) {
        display_element.append(titleView);
        display_element.append(textView);
        return;
      }

      var trial_data = {
        browser: browser || 'undefined',
        browser_version: clientJS.getBrowserMajorVersion() || 'undefined',
        browser_engine: clientJS.getEngine() || 'undefined',
        browser_engine_version: clientJS.getEngineVersion() || 'undefined',
        os: clientJS.getOS() || 'undefined',
        os_version: clientJS.getOSVersion() || 'undefined',
        screen_current_resolution: clientJS.getCurrentResolution() || 'undefined',
        screen_available_resolution: clientJS.getAvailableResolution() || 'undefined',
        user_timeZone: clientJS.getTimeZone() || 'undefined',
        user_language: clientJS.getLanguage() || 'undefined',
        user_sys_language: clientJS.getSystemLanguage() || 'undefined',
      }
      jsPsych.finishTrial(trial_data)
    };
    return plugin
})();