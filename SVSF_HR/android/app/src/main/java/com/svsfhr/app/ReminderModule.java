package com.svsfhr.app;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.net.Uri;
import android.provider.Settings;
import com.facebook.react.bridge.Promise;
import android.os.Build;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = ReminderModule.NAME)
public class ReminderModule extends ReactContextBaseJavaModule {
    public static final String NAME = "ReminderModule";
    private final ReactApplicationContext reactContext;

    public ReminderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod(isBlockingSynchronousMethod = false)
    public void showReminder(String message) {  // Removed taskId and title
        try {
            Context context = reactContext.getApplicationContext();

            // Create and acquire wake lock first
            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
                PowerManager.FULL_WAKE_LOCK |
                        PowerManager.ACQUIRE_CAUSES_WAKEUP |
                        PowerManager.ON_AFTER_RELEASE,
                context.getPackageName() + ":ReminderWakeLock"
            );
            wakeLock.acquire(3 * 60 * 1000L); // 3 minute timeout

            // Handle keyguard dismissal for locked device
            KeyguardManager keyguardManager = (KeyguardManager) context.getSystemService(Context.KEYGUARD_SERVICE);
            if (keyguardManager.isKeyguardLocked()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Activity currentActivity = reactContext.getCurrentActivity();
                    if (currentActivity != null) {
                        keyguardManager.requestDismissKeyguard(
                                currentActivity,
                                new KeyguardManager.KeyguardDismissCallback() {
                                    @Override
                                    public void onDismissSucceeded() {
                                        launchReminderActivity(context, message, wakeLock); // Updated
                                    }

                                    @Override
                                    public void onDismissError() {
                                        // Fallback: try to show the reminder anyway
                                        launchReminderActivity(context, message, wakeLock); // Updated
                                    }
                                }
                        );
                    } else {
                        // If no activity is available, just launch the reminder
                        launchReminderActivity(context, message, wakeLock); // Updated
                    }
                } else {
                    // For older Android versions, try to show the reminder directly
                    launchReminderActivity(context, message, wakeLock); // Updated
                }
            } else {
                launchReminderActivity(context, message, wakeLock); // Updated
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = false)
    public void scheduleReminder(String message, double triggerAtMs) {
        try {
            Context context = reactContext.getApplicationContext();
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            Intent intent = new Intent(context, ReminderAlarmReceiver.class);
            intent.putExtra("message", message);

            int requestCode = message != null ? message.hashCode() : 0;
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Cancel any existing pending alarm for the same message
            alarmManager.cancel(pendingIntent);

            long at = (long) triggerAtMs;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, at, pendingIntent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = false)
    public void cancelReminder(String message) {
        try {
            Context context = reactContext.getApplicationContext();
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            Intent intent = new Intent(context, ReminderAlarmReceiver.class);
            intent.putExtra("message", message);
            int requestCode = message != null ? message.hashCode() : 0;
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            alarmManager.cancel(pendingIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void canDrawOverlays(Promise promise) {
        try {
            boolean allowed = android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M ||
                    Settings.canDrawOverlays(getReactApplicationContext());
            promise.resolve(allowed);
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    @ReactMethod
    public void requestOverlayPermission() {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                Uri uri = Uri.parse("package:" + getReactApplicationContext().getPackageName());
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, uri);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
            }
        } catch (Exception ignored) {}
    }

    @ReactMethod
    public void canScheduleExactAlarms(Promise promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                AlarmManager alarmManager = (AlarmManager) getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);
                promise.resolve(alarmManager != null && alarmManager.canScheduleExactAlarms());
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    @ReactMethod
    public void requestExactAlarmPermission() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
            } catch (Exception e) {
                try {
                    Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    fallback.setData(Uri.fromParts("package", getReactApplicationContext().getPackageName(), null));
                    fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getReactApplicationContext().startActivity(fallback);
                } catch (Exception ignored) {}
            }
        }
    }

    @ReactMethod
    public void isIgnoringBatteryOptimizations(Promise promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
                boolean ignoring = pm != null && pm.isIgnoringBatteryOptimizations(getReactApplicationContext().getPackageName());
                promise.resolve(ignoring);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    @ReactMethod
    public void requestIgnoreBatteryOptimizations() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
            } catch (Exception e) {
                try {
                    Intent settings = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getReactApplicationContext().startActivity(settings);
                } catch (Exception ignored) {}
            }
        }
    }

    private void launchReminderActivity(Context context, String message, PowerManager.WakeLock wakeLock) {  // Updated
        Intent intent = new Intent(context, ReminderActivity.class);
        intent.putExtra("message", message); // Removed taskId and title
        intent.setFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
                    Intent.FLAG_ACTIVITY_CLEAR_TOP |
                    Intent.FLAG_ACTIVITY_SINGLE_TOP |
                    Intent.FLAG_ACTIVITY_NO_HISTORY |
                    Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS |
                    Intent.FLAG_ACTIVITY_NO_ANIMATION |
                    Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT
        );

        // Add category for launching over lock screen
        intent.addCategory(Intent.CATEGORY_DEFAULT);

        // Start activity with new task flag to ensure it opens in foreground
        context.startActivity(intent);

        // Release wake lock after delay
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                if (wakeLock.isHeld()) {
                    wakeLock.release();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}