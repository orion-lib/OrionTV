package com.rntv.media

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class Media3PlayerViewManager : SimpleViewManager<Media3PlayerView>() {
  override fun getName(): String = "Media3PlayerView"

  override fun createViewInstance(reactContext: ThemedReactContext): Media3PlayerView {
    return Media3PlayerView(reactContext)
  }

  @ReactProp(name = "source")
  fun setSource(view: Media3PlayerView, source: ReadableMap?) {
    val uri = source?.getString("uri")
    view.setSource(uri)
  }

  @ReactProp(name = "controls", defaultBoolean = true)
  fun setControls(view: Media3PlayerView, controls: Boolean) {
    view.setControls(controls)
  }

  @ReactProp(name = "resizeMode")
  fun setResizeMode(view: Media3PlayerView, resizeMode: String?) {
    view.setResizeMode(resizeMode)
  }

  override fun onDropViewInstance(view: Media3PlayerView) {
    view.releasePlayer()
    super.onDropViewInstance(view)
  }
}
