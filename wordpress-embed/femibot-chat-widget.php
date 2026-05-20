<?php
/**
 * Plugin Name: Femibot Chat Widget
 * Description: Adds the Femibot AI chat widget as a floating chat bubble on your WordPress site.
 * Version: 1.3.0
 * Author: Femigrants
 *
 * ─── INSTALLATION ───────────────────────────────────────────────────────────
 *
 * OPTION A — As a WordPress Plugin (recommended):
 *   1. Create a folder called "femibot-chat-widget" inside wp-content/plugins/
 *   2. Copy this file AND femibot-chat-widget.js from wordpress-embed/ into
 *      that folder (run `npm run build:widget` to refresh the JS from source).
 *      Both files must be updated together when deploying.
 *   4. Activate the plugin from the WordPress admin → Plugins page.
 *
 * OPTION B — Via Theme's functions.php:
 *   1. Copy the femibot_enqueue_chat_widget() function and the add_action()
 *      call below into your theme's functions.php.
 *   2. Upload the JS file and update the URL.
 *
 * OPTION C — Via "Insert Headers and Footers" plugin or Custom HTML block:
 *   1. Paste the raw <script> tags (shown at the bottom of this file) into
 *      Settings → Insert Headers and Footers → Footer section, or into a
 *      Custom HTML block/widget.
 *
 * ─── CONFIGURATION ──────────────────────────────────────────────────────────
 *
 * Edit the values in FEMIBOT_CONFIG below to match your setup:
 *   - apiBaseUrl  : Your FastAPI backend URL (REQUIRED)
 *   - aiModel     : AI model name (default: gemini-2.5-flash)
 *   - title       : Chat header title
 *   - subtitle    : Chat header subtitle
 *   - primaryColor / secondaryColor : Brand gradient colours
 *   - exampleQuestions : Array of suggested questions
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

function femibot_enqueue_chat_widget() {
    // ──────────────────────────────────────────────────────────────────────
    // CONFIGURATION — Change these values to match your environment
    // ──────────────────────────────────────────────────────────────────────
    $config = array(
        'apiBaseUrl'       => 'https://femigrants-chatbot-backend.vercel.app',
        'aiModel'          => 'gemini-2.5-flash',
        'title'            => 'Femibot AI Assistant',
        'subtitle'         => 'Online • Ready to help',
        'primaryColor'     => '#582BB6',
        'secondaryColor'   => '#7B52C9',
        'exampleQuestions'  => array(
            'What is your mission?',
            'What is your history?',
            'Do you accept donations?',
            'What is your board of directors?',
        ),
    );

    // ──────────────────────────────────────────────────────────────────────
    // JS file location — update this path if you host the file elsewhere
    // ──────────────────────────────────────────────────────────────────────
    // If the JS file is in the same plugin folder:
    $js_url = plugin_dir_url( __FILE__ ) . 'femibot-chat-widget.js';

    // jsDelivr from GitHub — pin a commit SHA; @main is often cached stale on jsDelivr:
    // $js_url = 'https://cdn.jsdelivr.net/gh/femigrants-tech/chatbot-frontend@76d56b4/dist-widget/femibot-chat-widget.js';

    // Inject the config object before the widget script
    wp_enqueue_script(
        'femibot-chat-widget',
        $js_url,
        array(), // no dependencies
        '1.3.0',
        true     // load in footer
    );

    // Pass configuration to the widget via inline script
    wp_add_inline_script(
        'femibot-chat-widget',
        'window.FEMIBOT_CONFIG = ' . wp_json_encode( $config ) . ';',
        'before'
    );
}
add_action( 'wp_enqueue_scripts', 'femibot_enqueue_chat_widget' );

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * OPTION C — Raw HTML snippet (for "Insert Headers & Footers" plugin,
 *            Custom HTML block, or any page builder)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Paste this into your footer section or Custom HTML widget:
 *
 * <script>
 *   window.FEMIBOT_CONFIG = {
 *     apiBaseUrl: "https://femigrants-chatbot-backend.vercel.app",
 *     aiModel: "gemini-2.5-flash",
 *     title: "Femibot AI Assistant",
 *     subtitle: "Online • Ready to help",
 *     primaryColor: "#582BB6",
 *     secondaryColor: "#7B52C9",
 *     exampleQuestions: [
 *       "What is your mission?",
 *       "What is your history?",
 *       "Do you accept donations?",
 *       "What is your board of directors?"
 *     ]
 *   };
 * </script>
 * <script src="https://cdn.jsdelivr.net/gh/femigrants-tech/chatbot-frontend@76d56b4/dist-widget/femibot-chat-widget.js"></script>
 * (Use a commit SHA — not @main — or jsDelivr may serve an old cached bundle with Sources UI.)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
