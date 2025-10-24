package com.svsfhr.app;

import android.util.Log;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ReminderPackage implements ReactPackage {
    private static final String TAG = "ReminderPackage";

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        Log.d(TAG, "createNativeModules called");
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ReminderModule(reactContext));
        modules.add(new SharedPreferencesModule(reactContext));
        Log.d(TAG, "Added modules to modules list");
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}