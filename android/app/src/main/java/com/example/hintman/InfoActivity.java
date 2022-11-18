package com.example.hintman;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.icu.text.IDNA;
import android.os.Bundle;
import android.widget.Button;

public class InfoActivity extends AppCompatActivity {

    private Button scannerButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info);

        scannerButton = (Button) findViewById(R.id.scan_button);
        scannerButton.setOnClickListener(v -> openScanActivity());
    }

    private void openScanActivity() {
        Intent intent = new Intent(this, ScannerActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        InfoActivity.this.finish();
    }
}