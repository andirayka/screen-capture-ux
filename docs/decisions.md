# Decisions

The reasoning behind the shape of this project. Captured because the platform
differences here are easy to get wrong, and the wrong version still looks like
it works.

## Why three modes instead of one feature

"Detect a screenshot" and "block a screenshot" are usually described as two
features. On Android they are two different mechanisms with very different
costs, and on iOS one of them barely exists. Putting all three policies behind
one switch is the only way to feel that difference rather than read about it.

- **Allowed** is the control. Without it you cannot tell what your own code is
  doing.
- **Allowed, but detected** is what Instagram does. The capture succeeds. The
  app is told afterwards, which is useful for a notice and useless as a control.
- **Blocked** is a different mechanism entirely: it asks the platform to refuse.

## Why the app opens in Allowed

Allowed is the control, and the demo is unreadable without it: a screenshot that
lands in Photos is the only thing that makes a refused one mean anything. Opening
in `detected` also raises a photo permission on Android 13 and below the moment
the screen mounts — asking for the gallery before the viewer knows what the screen
is for. The control mode costs nothing and prompts for nothing.

## Why detection is only wired in the detected mode

The listener is only registered while the policy is `detected`. Registering it
in `blocked` as well would suggest the app learns about a capture it just
prevented, and on Android that is simply untrue — the refused press produces no
event. Keeping the listener bound to the mode it belongs to makes the stage
honest.

## Why the teardown restore is a separate effect

The policy effect owns the runtime switch while the screen is mounted. A second,
empty-dependency effect always calls `allowScreenCaptureAsync` on unmount.

Collapsing them is tempting and wrong: the cleanup of a policy effect that
depends on the policy runs on _every_ policy change, so leaving `blocked` and
returning to it would issue an allow and a prevent in the same commit. Keeping
teardown separate means exactly one call is made when the screen leaves, and it
is always the safe one.

Leaving the screen without restoring would leave the whole device unable to take
screenshots until the app is killed.

## Why the app asks for a media permission only sometimes

Android 14 and up reports screenshots without a permission. Below that, the
callback is served by watching the media store, which costs `READ_MEDIA_IMAGES`
(and `READ_EXTERNAL_STORAGE` before Android 13).

The Expo docs describe the boundary two different ways — "Android 14+" in the
prose and "post-Android 13" in the API table — so the check sits on the
conservative side of that disagreement and requests only where the permission is
unambiguously required. A refusal is not an error: the mode stays selected, the
stage says detection is unavailable, and the other two modes are
unaffected.

Declaring both permissions in `app.json` belongs to the same decision: a request
for a permission the manifest does not carry is refused without a dialog, so the
prompt only exists on a build that declared it. Expo Go does not declare
`READ_MEDIA_IMAGES`, which is why the permission path has to be shown on a
development or preview build — or on an Android 12 device, where Expo Go does
declare `READ_EXTERNAL_STORAGE`.

## Why the stage reports the device, not the mode

The mode is what the user asked for. The stage is what the device is doing:
whether detection is listening, blocked on a permission, or unavailable on this
release, and whether the platform accepted the switch at all.

Those two things disagree more often than is comfortable, and a demo that only
shows the requested state teaches the wrong thing. The stage is also the whole
screen below the selector — there is no separate panel to read past, because on
camera the difference between the modes has to land in one glance.

## Why blocked does not react to a refused capture

The obvious thing to build is a jolt on the stage the moment a blocked capture
is refused. On Android that event does not exist. `FLAG_SECURE` makes the
platform refuse the capture before the app is involved, and the refused press
produces no callback, no error, and nothing in the listener — which is the whole
point of the mode, and the reason the listener is not even registered there.

So `blocked` states the seal instead: a second frame inside the mode frame, held
for as long as the mode is on. A moving blocked screen would be the demo
inventing the event it exists to prove is missing. The shake belongs to the
detection alert, where there is a real capture to react to.

## Why the alert is a full screen and not a pill

A pill in the corner is what Instagram ships, and it is the right product
decision for a chat app. It is the wrong demo decision: the post's claim is that
the capture succeeded and the file is already gone. A screenshot that has
already left the building deserves the whole screen, the count of captures so
far, and a jolt when a second one lands.

## Why the alert stays mounted and animates

The alert is always in the tree and animates opacity rather than mounting on
each screenshot. A screenshot taken while the alert is still fading out is
common — people take two in a row — and a mount-based alert would restart with
a visible pop. Animating a value that is already on screen reads as one
continuous signal. The shake is separate: it is driven by the capture timestamp,
so each new capture re-runs it without touching visibility.

## Why `useAnimatedValue` rather than `useRef(new Animated.Value(...))`

React Compiler's lint rules forbid reading `ref.current` during render. Animated
values are read during render to build interpolations, so the ref pattern fails
lint. `useAnimatedValue` is React Native's purpose-built hook for this and keeps
the animated values compiler-safe.

## Why no `setState` directly in an effect body

React Compiler's lint rules reject it. The detection effect therefore opens by
awaiting `isAvailableAsync()` — which it needs anyway — so every state update
downstream of it lands on the async side of the boundary.

`useTransientFlag` applies the same rule to a timer: it records the trigger
value that has expired rather than flipping a boolean from an effect body, so
the only `setState` call happens inside the timeout callback.

## Why the shape of iOS prevention is documented rather than trusted

`preventScreenCaptureAsync()` on iOS moves the key window's layer inside a
`UITextField` with `isSecureTextEntry` set, because the system excludes that
layer from captures. Apple documents the behaviour as preventing recording "in
some cases", and it has stopped working in past iOS releases.

The demo supports it and the README says plainly what it depends on. Anyone
building on this should know they are relying on undocumented behaviour, not a
supported guarantee.
