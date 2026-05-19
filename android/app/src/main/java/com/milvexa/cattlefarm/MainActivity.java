package com.milvexa.cattlefarm;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import android.view.WindowManager;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Anti-Hacking Layer: Prevent screenshots and screen recording
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
    }
}
