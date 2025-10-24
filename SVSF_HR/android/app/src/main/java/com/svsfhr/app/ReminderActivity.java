package com.svsfhr.app;

import android.os.Build;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.WindowManager;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AlertDialog;
import android.content.DialogInterface;
import android.view.Window;
import android.app.KeyguardManager;
import android.content.Context;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactContext;
import android.util.Log;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

public class ReminderActivity extends AppCompatActivity {
    
    private TextView titleText;
    private TextView messageText;
    private Button dismissButton;
    private Button snoozeButton;
    private MediaPlayer mediaPlayer;
    private SharedPreferences sharedPreferences;

    @Override
    public void onBackPressed() {
        // Prevent back button from closing
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize SharedPreferences
        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        
        // Handle lock screen
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            keyguardManager.requestDismissKeyguard(this, null);
        }

        // Set window flags
        Window window = getWindow();
        window.addFlags(
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );
        
        setContentView(R.layout.activity_reminder);

        // Setup gradient background
        GradientDrawable gradientDrawable = new GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            new int[] {
                Color.parseColor("#006666"),
                Color.parseColor("#000000")
            }
        );
        
        LinearLayout rootLayout = findViewById(R.id.rootLayout);
        rootLayout.setBackground(gradientDrawable);

        // Initialize views
        titleText = findViewById(R.id.titleText);
        messageText = findViewById(R.id.messageText);
        dismissButton = findViewById(R.id.dismissButton);
        snoozeButton = findViewById(R.id.snoozeButton);

        // Get data from intent
        String message = getIntent().getStringExtra("message");
        if (message == null) message = "Reminder Message";
        
        String title = "Reminder!";
        titleText.setText(title);
        messageText.setText(message);

        // Initialize and start playing sound
        startAlarmSound();

        // Handle snooze button click: show centered dialog of minute options
        snoozeButton.setOnClickListener(this::showSnoozeDialog);

        // Handle dismiss button click
        dismissButton.setOnClickListener(v -> {
            handleReminderAction("onDismiss");
            stopAlarmSound();
            finish();
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Ensure window flags are set when activity starts
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Start sound when activity resumes
        if (mediaPlayer == null || !mediaPlayer.isPlaying()) {
            startAlarmSound();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Handle new intents
        String message = intent.getStringExtra("message");
        if (message != null) messageText.setText(message);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarmSound();
    }

    private void showSnoozeDialog(View anchor) {
        final int[] minuteOptions = new int[] {5, 10, 15, 30, 60, 120};
        final String[] labels = new String[minuteOptions.length];
        for (int i = 0; i < minuteOptions.length; i++) {
            labels[i] = formatMinutesLabel(minuteOptions[i]);
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Remind me in");
        builder.setItems(labels, (dialog, which) -> {
            int selectedMinutes = minuteOptions[which];
            handleSnoozeSelection(selectedMinutes);
        });
        builder.setNegativeButton("Cancel", (d, w) -> d.dismiss());
        builder.show();
    }

    private String formatMinutesLabel(int minutes) {
        if (minutes >= 60) {
            int hours = minutes / 60;
            return hours + (hours == 1 ? " hour" : " hours");
        }
        return minutes + " minutes";
    }

    private void handleSnoozeSelection(int minutes) {
        try {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putInt("last_snooze_minutes", minutes);
            editor.apply();
        } catch (Exception ignored) {}

        handleReminderAction("onSnooze");
        stopAlarmSound();
        finish();
    }

    private void handleReminderAction(String action) {
        try {
            // Save the action and message to SharedPreferences
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("last_reminder_action", action);
            editor.putString("last_reminder_message", messageText.getText().toString());
            editor.putLong("last_reminder_timestamp", System.currentTimeMillis());
            editor.apply();

            // Log for debugging
            Log.d("ReminderActivity", "Saved reminder action: " + action + " for message: " + messageText.getText().toString());
        } catch (Exception e) {
            Log.e("ReminderActivity", "Error saving reminder action: " + e.getMessage());
        }
    }

    private void startAlarmSound() {
        try {
            if (mediaPlayer == null) {
                mediaPlayer = MediaPlayer.create(this, R.raw.notification_sound1);
                mediaPlayer.setLooping(true);
            }
            if (!mediaPlayer.isPlaying()) {
                mediaPlayer.start();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void stopAlarmSound() {
        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.stop();
            }
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }
}