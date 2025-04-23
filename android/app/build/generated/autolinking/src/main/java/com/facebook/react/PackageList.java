package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.ArrayList;

// @react-native-async-storage/async-storage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
// @react-native-clipboard/clipboard
import com.reactnativecommunity.clipboard.ClipboardPackage;
// @react-native-community/checkbox
import com.reactnativecommunity.checkbox.ReactCheckBoxPackage;
// @react-native-community/datetimepicker
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
// @react-native-firebase/app
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
// @react-native-firebase/auth
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;
// @react-native-firebase/crashlytics
import io.invertase.firebase.crashlytics.ReactNativeFirebaseCrashlyticsPackage;
// @react-native-picker/picker
import com.reactnativecommunity.picker.RNCPickerPackage;
// expo
import expo.modules.ExpoModulesPackage;
// react-native-action-sheet
import com.actionsheet.ActionSheetPackage;
// react-native-device-info
import com.learnium.RNDeviceInfo.RNDeviceInfo;
// react-native-encrypted-storage
import com.emeraldsanto.encryptedstorage.RNEncryptedStoragePackage;
// react-native-gesture-handler
import com.swmansion.gesturehandler.RNGestureHandlerPackage;
// react-native-keep-awake
import com.corbt.keepawake.KCKeepAwakePackage;
// react-native-network-info
import com.pusherman.networkinfo.RNNetworkInfoPackage;
// react-native-pager-view
import com.reactnativepagerview.PagerViewPackage;
// react-native-reanimated
import com.swmansion.reanimated.ReanimatedPackage;
// react-native-safe-area-context
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
// react-native-screens
import com.swmansion.rnscreens.RNScreensPackage;
// react-native-sms
import com.tkporter.sendsms.SendSMSPackage;
// react-native-sound
import com.zmxv.RNSound.RNSoundPackage;
// react-native-vector-icons
import com.oblador.vectoricons.VectorIconsPackage;
// react-native-vision-camera
import com.mrousavy.camera.react.CameraPackage;
// react-native-webview
import com.reactnativecommunity.webview.RNCWebViewPackage;

public class PackageList {
  private Application application;
  private ReactNativeHost reactNativeHost;
  private MainPackageConfig mConfig;

  public PackageList(ReactNativeHost reactNativeHost) {
    this(reactNativeHost, null);
  }

  public PackageList(Application application) {
    this(application, null);
  }

  public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
    this.reactNativeHost = reactNativeHost;
    mConfig = config;
  }

  public PackageList(Application application, MainPackageConfig config) {
    this.reactNativeHost = null;
    this.application = application;
    mConfig = config;
  }

  private ReactNativeHost getReactNativeHost() {
    return this.reactNativeHost;
  }

  private Resources getResources() {
    return this.getApplication().getResources();
  }

  private Application getApplication() {
    if (this.reactNativeHost == null) return this.application;
    return this.reactNativeHost.getApplication();
  }

  private Context getApplicationContext() {
    return this.getApplication().getApplicationContext();
  }

  public ArrayList<ReactPackage> getPackages() {
    return new ArrayList<>(Arrays.<ReactPackage>asList(
      new MainReactPackage(mConfig),
      new AsyncStoragePackage(),
      new ClipboardPackage(),
      new ReactCheckBoxPackage(),
      new RNDateTimePickerPackage(),
      new ReactNativeFirebaseAppPackage(),
      new ReactNativeFirebaseAuthPackage(),
      new ReactNativeFirebaseCrashlyticsPackage(),
      new RNCPickerPackage(),
      new ExpoModulesPackage(),
      new ActionSheetPackage(),
      new RNDeviceInfo(),
      new RNEncryptedStoragePackage(),
      new RNGestureHandlerPackage(),
      new KCKeepAwakePackage(),
      new RNNetworkInfoPackage(),
      new PagerViewPackage(),
      new ReanimatedPackage(),
      new SafeAreaContextPackage(),
      new RNScreensPackage(),
      new SendSMSPackage(),
      new RNSoundPackage(),
      new VectorIconsPackage(),
      new CameraPackage(),
      new RNCWebViewPackage()
    ));
  }
}