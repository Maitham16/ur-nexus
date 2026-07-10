import {
  CHANGELOG_URL,
  fetchAndStoreChangelog,
  getAllReleaseNotes,
  getStoredChangelog,
  init_releaseNotes
} from "./index-k6d66rq6.js";
import"./index-j9j0h3gp.js";
import"./index-a38sm3ww.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/release-notes/release-notes.ts
function formatReleaseNotes(notes) {
  return notes.map(([version, notes2]) => {
    const header = `Version ${version}:`;
    const bulletPoints = notes2.map((note) => `· ${note}`).join(`
`);
    return `${header}
${bulletPoints}`;
  }).join(`

`);
}
async function call() {
  let freshNotes = [];
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout((rej) => rej(new Error("Timeout")), 500, reject);
    });
    await Promise.race([fetchAndStoreChangelog(), timeoutPromise]);
    freshNotes = getAllReleaseNotes(await getStoredChangelog());
  } catch {}
  if (freshNotes.length > 0) {
    return { type: "text", value: formatReleaseNotes(freshNotes) };
  }
  const cachedNotes = getAllReleaseNotes(await getStoredChangelog());
  if (cachedNotes.length > 0) {
    return { type: "text", value: formatReleaseNotes(cachedNotes) };
  }
  return {
    type: "text",
    value: `See the full changelog at: ${CHANGELOG_URL}`
  };
}
var init_release_notes = __esm(() => {
  init_releaseNotes();
});
init_release_notes();

export {
  call
};
