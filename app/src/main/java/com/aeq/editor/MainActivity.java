package com.aeq.editor;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JsPromptResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

/**
 * Alight Effects Q shell. Serves the bundled web app (assets/www) from a private
 * https origin so ES modules work, with no network permission.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.aeq.local";
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(0xFF0E0A14);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setUserAgentString(s.getUserAgentString() + " AEQApp/0.1");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return serve(r.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                if (HOST.equals(r.getUrl().getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); }
                catch (ActivityNotFoundException ignored) { }
                return true;
            }
        });

        // WebView ignores window.prompt() unless the host app implements it (used by "Edit text").
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsPrompt(WebView v, String url, String message, String def, final JsPromptResult res) {
                final EditText et = new EditText(MainActivity.this);
                et.setSingleLine(true);
                et.setText(def);
                et.setSelection(et.getText().length());
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle(message)
                        .setView(et)
                        .setPositiveButton(android.R.string.ok, (d, w) -> res.confirm(et.getText().toString()))
                        .setNegativeButton(android.R.string.cancel, (d, w) -> res.cancel())
                        .setOnCancelListener(d -> res.cancel())
                        .show();
                return true;
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("https://" + HOST + "/index.html");
    }

    private WebResourceResponse serve(Uri u) {
        if (!HOST.equals(u.getHost())) return null;
        String p = u.getPath();
        if (p == null || p.equals("/")) p = "/index.html";
        if (p.contains("..")) return notFound();
        try {
            InputStream in = getAssets().open("www" + p);
            String mime = mime(p);
            boolean text = mime.startsWith("text/") || mime.contains("json") || mime.contains("manifest");
            return new WebResourceResponse(mime, text ? "UTF-8" : null, in);
        } catch (IOException e) {
            return notFound();
        }
    }

    private static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }

    private static String mime(String p) {
        String x = p.substring(p.lastIndexOf('.') + 1).toLowerCase();
        switch (x) {
            case "html": return "text/html";
            case "js": case "mjs": return "text/javascript";
            case "css": return "text/css";
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "svg": return "image/svg+xml";
            case "json": return "application/json";
            case "webmanifest": return "application/manifest+json";
            default: return "application/octet-stream";
        }
    }

    @Override
    public void onBackPressed() {           // web history: editor -> home -> exit
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override protected void onSaveInstanceState(Bundle b) { super.onSaveInstanceState(b); web.saveState(b); }
    @Override protected void onPause() { web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
