package com.example.hintman;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.storage.FileDownloadTask;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;

import java.io.File;
import java.io.IOException;

public class HintActivity extends AppCompatActivity {

    ImageView hintImageView;
    TextView hintText;
    Button scanButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hint);

        Bundle bundle = getIntent().getExtras();
        String page = bundle.getString("pageCode");

        hintText = findViewById(R.id.hint_text);
        hintImageView = findViewById(R.id.hint_image);

        scanButton = findViewById(R.id.scan_button);
        scanButton.setOnClickListener(v -> openScanActivity());

        setUpHint(page);
    }

    private void setUpHint(String page) {
        SharedPreferences preferences = getSharedPreferences("autoLogin", MODE_PRIVATE);
        String loggedMail = preferences.getString("loggedMail", "");

        /* reference to user's hint */
        StorageReference hintRef = FirebaseStorage.getInstance().getReference(loggedMail + "/" + page + ".png");

        /* fetch user's hint from database and set it */
        try {
            File localFile = File.createTempFile("tempFile", "png");
            hintRef.getFile(localFile).addOnSuccessListener(new OnSuccessListener<FileDownloadTask.TaskSnapshot>() {
                @Override
                public void onSuccess(FileDownloadTask.TaskSnapshot taskSnapshot) {
                    hintText.setText(String.format(getResources().getString(R.string.page_hint), page));
                    Bitmap bitmap = BitmapFactory.decodeFile(localFile.getAbsolutePath());
                    hintImageView.setImageBitmap(bitmap);
                }
            }).addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception e) {
                    hintText.setText(getResources().getString(R.string.no_hint));
                    hintImageView.setImageResource(R.drawable.sad);
                }
            });
        } catch (IOException e) {
            Toast.makeText(HintActivity.this, "Something went wrong",
                    Toast.LENGTH_SHORT).show();
        }
    }

    private void openScanActivity() {
        Intent intent = new Intent(this, ScannerActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        HintActivity.this.finish();
    }
}