package com.rntv.media

import android.content.Context
import android.net.Uri
import android.widget.FrameLayout
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView

class Media3PlayerView(context: Context) : FrameLayout(context) {
  private val playerView: PlayerView = PlayerView(context)
  private val exoPlayer: ExoPlayer = ExoPlayer.Builder(context).build()

  init {
    playerView.player = exoPlayer
    playerView.useController = true
    playerView.layoutParams =
      LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    addView(playerView)
  }

  fun setSource(uri: String?) {
    if (uri.isNullOrEmpty()) {
      exoPlayer.clearMediaItems()
      return
    }
    val mediaItem = MediaItem.fromUri(Uri.parse(uri))
    exoPlayer.setMediaItem(mediaItem)
    exoPlayer.prepare()
    exoPlayer.playWhenReady = true
  }

  fun setControls(enabled: Boolean) {
    playerView.useController = enabled
  }

  fun setResizeMode(mode: String?) {
    val resizeMode =
      when (mode) {
        "cover" -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
        "stretch" -> AspectRatioFrameLayout.RESIZE_MODE_FILL
        else -> AspectRatioFrameLayout.RESIZE_MODE_FIT
      }
    playerView.resizeMode = resizeMode
  }

  fun releasePlayer() {
    exoPlayer.playWhenReady = false
    exoPlayer.stop()
    exoPlayer.release()
  }
}
