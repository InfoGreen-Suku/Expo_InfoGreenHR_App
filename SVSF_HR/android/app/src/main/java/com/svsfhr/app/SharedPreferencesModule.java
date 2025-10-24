package com.svsfhr.app;

import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class SharedPreferencesModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private SharedPreferences sharedPreferences;

    public SharedPreferencesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.sharedPreferences = PreferenceManager.getDefaultSharedPreferences(reactContext);
    }

    @Override
    public String getName() {
        return "SharedPreferences";
    }

    @ReactMethod
    public void getString(String key, String defaultValue, Promise promise) {
        try {
            String value = sharedPreferences.getString(key, defaultValue);
            promise.resolve(value);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getLong(String key, Double defaultValue, Promise promise) {
        try {
            long value = sharedPreferences.getLong(key, defaultValue.longValue());
            promise.resolve((double) value);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getInt(String key, Double defaultValue, Promise promise) {
        try {
            int value = sharedPreferences.getInt(key, defaultValue.intValue());
            promise.resolve((double) value);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void removeItem(String key, Promise promise) {
        try {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.remove(key);
            editor.apply();
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
} 