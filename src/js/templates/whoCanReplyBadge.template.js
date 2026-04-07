import { html } from "/js/lib/lit-html.js";
import { getThreadgateAllowSettings } from "/js/dataHelpers.js";
import { showWhoCanReplyModal } from "/js/modals.js";
import { usersIconTemplate } from "/js/templates/icons/usersIcon.template.js";

export function whoCanReplyBadgeTemplate({ post }) {
  const settings = getThreadgateAllowSettings(post);
  const embeddingDisabled = !!post?.viewer?.embeddingDisabled;
  const isEverybody = !Array.isArray(settings) && settings.type === "everybody";
  if (isEverybody && !embeddingDisabled) {
    return null;
  }
  let label;
  if (isEverybody) {
    label = "Everybody can reply";
  } else if (!Array.isArray(settings) && settings.type === "nobody") {
    label = "Replies disabled";
  } else {
    label = "Some people can reply";
  }
  return html`
    <button
      type="button"
      class="who-can-reply-badge"
      data-testid="who-can-reply-badge"
      @click=${(e) => {
        e.stopPropagation();
        showWhoCanReplyModal({ post });
      }}
    >
      ${usersIconTemplate()} ${label}
    </button>
  `;
}
