// This must be imported into your JavaScript right beneath your Google
// Analytics code, as in right AFTER the end script tag right after your Google
// Analytics code:
// ga('send', 'pageview');
// </script>

// Google Tag Manager
!(function (w, d, s, l, i) {
  w[l] = w[l] || []
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" })
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : ""
  j.async = true
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl
  f.parentNode.insertBefore(j, f)
})(window, document, "script", "dataLayer", "GTM-WGXZSLV")

window.dataLayer = window.dataLayer || []

$(window).on("gtmEvent", function (event, data) {
  window.dataLayer.push(data)
})

// Meta (Facebook) Pixel
!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return

  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
  }

  if (!f._fbq) f._fbq = n
  n.push = n
  n.loaded = !0
  n.version = "2.0"
  n.queue = []
  t = b.createElement(e)
  t.async = !0
  t.src = v
  s = b.getElementsByTagName(e)[0]
  s.parentNode.insertBefore(t, s)
})(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js")

fbq("init", "851867179267787")
fbq("track", "PageView")

$(window).on("email-submit", (event, data) => {
  fbq("trackCustom", "email_submit", data)
})

// An event listener to track program load time (by Lyudmil)
jQuery(window).one("guidedtrack:pageStart", function () {
  if (typeof ga === "undefined") return

  if (window.performance) {
    // let url = [location.protocol, '//', location.host, location.pathname].join('');
    programLoadTime = Math.round(performance.now())

    // ga('send', 'timing', url, 'load', programLoadTime);
    ga("send", "timing", "Content Fully Loaded", "load", programLoadTime)
  }
})

// An event listener that can be triggered from GuidedTrack that sends custom
// events to Google Analytics
$(window).on("googleAnalytics", function (event, data) {
  if (typeof ga === "undefined") return
  // Assume data is of the form:
  //
  // {
  //   "category" -> text,
  //   "action" -> text,
  //   "label" -> text,
  //   "value" -> integer,
  // }
  //
  // | Field Name    | Value Type | Required | Description                                                  |
  // | ------------- | ---------- | -------- | ------------------------------------------------------------ |
  // | eventCategory | text       | yes      | Typically the object that was interacted with (e.g. 'Video') |
  // | eventAction   | text       | yes      | The type of interaction (e.g. 'play')                        |
  // | eventLabel    | text       | no       | Useful for categorizing events (e.g. 'Fall Campaign')        |
  // | eventValue    | integer    | no       | A numeric value associated with the event (e.g. 42)          |
  //
  // Example: ga('send', 'event', 'Videos', 'play', 'Fall Campaign');
  // Generic: ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);
  // *send: { "category" -> "Page", "action" -> "Start", "label" -> "My Program Name", "value" -> 10 }

  if (typeof data.action === "undefined") {
    alert("You forgot to provide an action in your GuidedTrack *trigger!")
  }

  if (typeof data.category === "undefined") {
    alert("You forgot to provide a category in your GuidedTrack *trigger!")
  }

  if (typeof data.label === "undefined") {
    data.label = ""
  }

  if (typeof data.value === "undefined") {
    data.value = 0
  }

  ga("send", "event", data.category, data.action, data.label, data.value)
  // alert('just sent this to google analytics: ' + Object.keys(data) + " category: " + data.category + " action: " + data.action + " label: " + data.label + " value: " + data.value);
})

// An event listener that can be triggered from GuidedTrack that changes the
// page URL based on:
// http://stackoverflow.com/questions/824349/modify-the-url-without-reloading-the-page
$(window).on("changePage", function (event, data) {
  if (typeof ga === "undefined") return
  // var currentPath = window.location.pathname;
  // if there is any part of the url with a #, preserve it when we change the page!
  // var postHash = window.location.hash
  // var currentPathNoPage = currentPath.split("/page/")[0];
  // window.history.pushState({},"", currentPathNoPage + "/page/" + data.page + postHash);
  // alert('window.location.pathname' + window.location.pathname);  //only has the html file name, not the full url
  // alert('window.location.href: ' + window.location.href);
  // let url = [location.protocol, '//', location.host, location.pathname].join('');
  console.log("page is: " + data.page)
  // let page = url + '/page/' + data.page;
  // let page = '/page/' + data.page;
  let page = location.pathname + "/page/" + data.page
  ga("set", "page", page)
  ga("send", "pageview")
})

// An event listener to open `data.url` in a new tab. Used by the "Clearer
// Thinking - End Cards" program.
$(window).on("openUrlInNewTab", (event, data) => {
  window.open(data.url, "_blank").focus()

  // Don't trigger twice in case program HTML file also includes this code (to
  // avoid adblockers stopping it).
  event.stopImmediatePropagation()

  // This event ("openUrlInNewTab") is probably usually triggered by clicking
  // on a clickable component. When that happens, a navigation event usually
  // occurs, even though it generally only results in the same "page" (in the
  // GT sense) being re-rendered. In some cases, though, this can create
  // unexpected or undesirable side effects, especially in cases where
  // significant events (like sending emails) happen on the "page" that's being
  // re-rendered. To work around this, I'm adding an additional trigger here
  // called "afterOpenUrlInNewTab". An event with this name can be defined in
  // *events (or in JS), making it possible to catch the navigation event and
  // re-route it elsewhere. For example:
  //
  // *events
  //     afterOpenUrlInNewTab
  //         *goto: someOtherLabel
  //             *reset
  //
  // ~ Josh (2023-06-01)
  //
  // UPDATE: Lyudmil proposed a more elegant solution. This particular example
  // assumes that the action that should *not* be repeated is an email send on
  // the last page; but this pattern can be adapted to other similar situations.
  //
  // ----------
  //
  // >> send_email = "yes"
  //
  // -- last page break item before final page (e.g., a *question, *page, etc.)
  //
  // *if: send_email = "yes"
  //     *email
  //
  // >> send_email = "no"
  // *program: Clearer Thinking - End Cards
  //
  // ----------
  //
  // So, when a user clicks on a card on the last page, they'll be sent back to
  // the line that starts with "-- last page break...". However, I'll leave this
  // "afterOpenUrlInNewTab" trigger in place in case anyone's using it.
  //
  // ~ Josh (2023-07-01)
  console.log("triggering the 'afterOpenUrlInNewTab' event...")
  $(window).trigger("afterOpenUrlInNewTab")
})

// Previously, CT programs relied on social sharing buttons from AddThis. But
// since AddThis was shut down recently, we've switched to using ShareThis,
// which does basically the same thing. By default, the "sticky" ShareThis
// buttons (i.e., the buttons along the left side of the viewport) are loaded
// automatically on ALL Clearer Thinking programs. But the listener below asks
// ShareThis to re-initialize itself when a program triggers a "load-sharethis-
// inline-buttons" event, which will cause the ShareThis buttons to be loaded
// inline in the program as well as re-loaded on the left side of the page
// (assuming the program triggering this event provided a ".sharethis-inline-
// share-buttons" element in a `*html` block on the same page prior to
// triggering the event).
//
// ~ Josh (2023-07-01)
function querySelectorAsync(selector, timeout) {
  timeout = timeout || 5000

  return new Promise((resolve, reject) => {
    try {
      const start = new Date()

      const interval = setInterval(() => {
        const el = document.querySelector(selector)

        if (el) {
          clearInterval(interval)
          return resolve(el)
        } else if (new Date() - start > timeout) {
          clearInterval(interval)
          return resolve(undefined)
        }
      }, timeout / 100)
    } catch (e) {
      return reject(e)
    }
  })
}

function getCleanedPageURL() {
  const out = new URL(window.location.href)
  out.searchParams.delete("__gt_embed")

  if (!out.searchParams.get("__original_referrer")) {
    out.searchParams.delete("__original_referrer")
  }

  return out.toString()
}

$(window).on("load-sharethis-inline-buttons", async (event, data) => {
  const inline = await querySelectorAsync(".sharethis-inline-share-buttons")

  if (inline) {
    inline.setAttribute(
      "data-url",
      data && data.url ? data.url : getCleanedPageURL()
    )

    window.__sharethis__.initialize()
  } else {
    console.error(
      "Could not find the `.sharethis-inline-share-buttons` element!"
    )
  }
})

// Currently, the ShareThis buttons share URLs containing the ephemeral
// "__gt_embed" query string parameter. My (Josh's) hypothesis is that ShareThis
// copies the value of `window.location.href` when it loads for the first time
// and assigns that value to its buttons to share. The "__gt_embed" parameter is
// presumably only part of `window.location.href` for a few milliseconds, but it
// must be during that time that ShareThis loads. So, I'm adding a page load
// event that will re-initialize the ShareThis buttons after a little time has
// passed (so that the page will hopefully have fully finished loading and
// "__gt_embed" will no longer be part of `window.location.href`).
//
// ~ Josh (2023-07-02)
window.addEventListener("load", () => {
  setTimeout(async () => {
    const sticky = await querySelectorAsync(".sharethis-sticky-share-buttons")

    if (sticky) {
      sticky.setAttribute("data-url", getCleanedPageURL())
      window.__sharethis__.initialize()
    } else {
      console.error(
        "Could not find the `.sharethis-sticky-share-buttons` element!"
      )
    }
  }, 3000)
})

// The following code adds an event listener to the #navigation_share_button
// (which is only visible on mobile) and shows / hides the ShareThis buttons
// at the bottom of the screen when clicked. We added this because otherwise the
// ShareThis buttons permanently float over top of navigation bar at the bottom
// of the screen.
!(async () => {
  const navigationShareButton = await querySelectorAsync(
    "#navigation_share_button"
  )

  const shareThisButtons = await querySelectorAsync(
    ".sharethis-sticky-share-buttons"
  )

  const navigationContainer = await querySelectorAsync(".navigation_container")

  if (!navigationShareButton || !shareThisButtons || !navigationContainer) {
    return
  }

  let shareThisButtonsAreVisible = false

  const toggle = value => {
    shareThisButtonsAreVisible =
      typeof value === "undefined" ? !shareThisButtonsAreVisible : value

    if (shareThisButtonsAreVisible) {
      navigationShareButton.style.backgroundColor = "rgb(211, 211, 211)"
      navigationShareButton.style.zIndex = 1001
      shareThisButtons.classList.add("are-visible")
      navigationContainer.classList.add("sharethis-buttons-are-visible")
    } else {
      navigationShareButton.style.backgroundColor = "transparent"
      navigationShareButton.style.zIndex = 2
      shareThisButtons.classList.remove("are-visible")
      navigationContainer.classList.remove("sharethis-buttons-are-visible")
    }
  }

  navigationShareButton.addEventListener("click", event => {
    event.stopImmediatePropagation()
    toggle()
  })

  shareThisButtons.addEventListener("click", event => {
    event.stopImmediatePropagation()
  })

  window.addEventListener("click", () => {
    toggle(false)
  })

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      toggle(false)
    }
  })
})()
