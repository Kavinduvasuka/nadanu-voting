import{l as N,f as P,c as U,s as l,a as d,b as m}from"./shared-L6wdGVJ9.js";const V="modulepreload",M=function(r){return"/nadanu-voting/"+r},A={},x=function(n,e,t){let a=Promise.resolve();if(e&&e.length>0){let w=function(i){return Promise.all(i.map(E=>Promise.resolve(E).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),u=o?.nonce||o?.getAttribute("nonce");a=w(e.map(i=>{if(i=M(i),i in A)return;A[i]=!0;const E=i.endsWith(".css"),h=E?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${h}`))return;const f=document.createElement("link");if(f.rel=E?"stylesheet":V,E||(f.as="script"),f.crossOrigin="",f.href=i,u&&f.setAttribute("nonce",u),document.head.appendChild(f),E)return new Promise((B,L)=>{f.addEventListener("load",B),f.addEventListener("error",()=>L(new Error(`Unable to preload CSS for ${i}`)))})}))}function s(o){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=o,window.dispatchEvent(u),!u.defaultPrevented)throw o}return a.then(o=>{for(const u of o||[])u.status==="rejected"&&s(u.reason);return n().catch(s)})},F=document.getElementById("app");F.innerHTML=`
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${N()}
    <nav>
      <a href="./index.html">← BACK TO VOTING</a>
      <span class="admin-pill">ORGANIZER CONTROL ROOM</span>
    </nav>
  </div>
</header>

<main class="wrap admin-main">
  <div class="tiny-label">
    OFFICIAL NADANU 3.0 / BACKSTAGE
  </div>

  <h1 class="admin-title">CONTROL <em>ROOM.</em></h1>
  <div id="notice" class="notice" hidden></div>

  <section id="login" class="admin-panel narrow">
    <h2>AUTHORIZED ACCESS</h2>
    <p>Sign in using the organizer account created in Supabase Authentication.</p>

    <form id="login-form">
      <label>
        EMAIL
        <input type="email" id="email"
          autocomplete="username" required
          placeholder="organizer@example.com"/>
      </label>

      <label>
        PASSWORD
        <input type="password" id="password"
          autocomplete="current-password"
          required minlength="6"/>
      </label>

      <button class="btn btn-orange" type="submit">
        SIGN IN ↗
      </button>
    </form>
  </section>

  <section id="dashboard" hidden>
    <div class="dash-top">
      <div>
        <h2>THE LINEUP</h2>
        <p>Manage finalists, event status, and voting window.</p>
      </div>

      <button class="btn btn-outline" id="logout">
        SIGN OUT ↗
      </button>
    </div>

    <div class="admin-columns">
      <div class="admin-panel">
        <div class="tiny-label">VOTING CONTROL</div>

        <form id="event-form">
          <label>
            EVENT STATUS
            <select id="event-status">
              <option value="draft">DRAFT — NOT OPEN</option>
              <option value="open">OPEN FOR VOTING</option>
              <option value="closed">CLOSED</option>
            </select>
          </label>

          <label>
            START DATE & TIME (OPTIONAL)
            <input id="starts-at" type="datetime-local"/>
          </label>

          <label>
            END DATE & TIME (OPTIONAL)
            <input id="ends-at" type="datetime-local"/>
          </label>

          <button class="btn btn-orange" type="submit"
            id="save-status">
            SAVE VOTING STATUS
          </button>
        </form>
        <div class="chart-publish-control" id="chart-publish-control">
          <p><strong>PUBLIC RESULTS BAR CHART</strong></p>
          <p id="chart-publish-status">Chart is hidden from public voters.</p>
          <button class="btn btn-outline" type="button" id="toggle-results-chart" disabled>
            ENABLE RESULTS CHART
          </button>
          <p class="chart-publish-note">Only available after saving voting status as CLOSED. Closing voting alone never publishes results. Reopening voting automatically hides the chart.</p>
        </div>
      </div>

      <div class="admin-panel">
        <div class="tiny-label">ADD A FINALIST</div>

        <form id="contestant-form">
          <label>
            CATEGORY
            <select id="category" required></select>
          </label>

          <label>
            PERFORMER / TEAM NAME
            <input id="name" required maxlength="120"
              placeholder="e.g. The Fire Crew"/>
          </label>

          <label>
            STAGE NAME / SUBTITLE
            <input id="stage-name" maxlength="140"
              placeholder="e.g. Grand Finale Act"/>
          </label>

          <label>
            PERFORMANCE TITLE
            <input id="performance-title" maxlength="160"
              placeholder="e.g. Showstopper"/>
          </label>

          <label>
            UPLOAD FINALIST PHOTO (JPG, PNG OR WEBP - MAX 5 MB)
            <input id="image-file" type="file" accept="image/jpeg,image/png,image/webp"/>
          </label>
          <img id="image-preview" class="finalist-image-preview" alt="Selected finalist photo preview" hidden/>
          <label>
            OR PASTE PHOTO URL (OPTIONAL)
            <input id="image-url" type="url"
              placeholder="https://..."/>
          </label>

          <label>
            DISPLAY ORDER
            <input id="sort-order" type="number"
              min="0" value="1" required/>
          </label>

          <button class="btn btn-orange" type="submit">
            ADD FINALIST ↗
          </button>
        </form>
      </div>
    </div>

    <div class="admin-panel">
      <div class="tiny-label">ACTIVE FINALISTS</div>
      <div id="finalists" class="finalist-list"></div>
    </div>

    <div class="admin-panel" id="edit-panel" hidden>
      <div class="tiny-label">EDIT FINALIST</div>
      <form id="edit-form">
        <input id="edit-id" type="hidden"/>
        <label>CATEGORY<select id="edit-category" required></select></label>
        <label>PERFORMER / TEAM NAME<input id="edit-name" maxlength="120" required/></label>
        <label>STAGE NAME / SUBTITLE<input id="edit-stage-name" maxlength="140"/></label>
        <label>PERFORMANCE TITLE<input id="edit-performance-title" maxlength="160"/></label>
        <label>UPLOAD NEW PHOTO (OPTIONAL - JPG, PNG, WEBP; MAX 5 MB)
          <input id="edit-image-file" type="file" accept="image/jpeg,image/png,image/webp"/>
        </label>
        <img id="edit-image-preview" class="finalist-image-preview" alt="Current or selected finalist photo" hidden/>
        <label>OR UPDATE PHOTO URL<input id="edit-image-url" type="url"/></label>
        <label>DISPLAY ORDER<input id="edit-sort-order" type="number" min="0" required/></label>
        <button class="btn btn-orange" type="submit">SAVE CHANGES</button>
        <button class="btn btn-outline" id="cancel-edit" type="button">CANCEL</button>
      </form>
    </div>
    <div class="admin-panel">
      <div class="tiny-label">VOTE RESULTS</div>
      <p>
        Vote counts are restricted to authorized administrators
        and are not shown on the public voting page.
      </p>
      <div id="results" class="results-list"></div>

      <button class="btn btn-outline" id="refresh">
        REFRESH RESULTS ↻
      </button>
      <button class="btn btn-orange" id="download-results-pdf" type="button">
        DOWNLOAD VOTING RESULTS PDF ↓
      </button>
    </div>
    <div class="admin-panel">
      <div class="tiny-label">VOTER DEVICE RECORDS</div>
      <p>These device references are anonymous hashes, not phone names. Select a vote using its finalist, timestamp and reference. Resetting ONE vote requires admin credentials and is audited.</p>
      <button class="btn btn-outline" id="load-votes" type="button" aria-expanded="false" aria-controls="voter-records">VIEW VOTED DEVICES</button>
      <div id="voter-records" class="finalist-list" hidden></div>
      <form id="reset-form" hidden>
        <input id="reset-vote-id" type="hidden"/>
        <p id="reset-selection"></p>
        <label>ADMIN EMAIL<input id="reset-email" type="email" required autocomplete="username"/></label>
        <label>ADMIN PASSWORD<input id="reset-password" type="password" required autocomplete="current-password"/></label>
        <button class="btn btn-orange" id="confirm-reset" type="submit">VERIFY ADMIN & RESET SELECTED VOTE</button>
        <button class="btn btn-outline" id="cancel-reset" type="button">CANCEL</button>
      </form>
    </div>
  </section>
</main>

${P()}
`;let R=[],v=[],b=null;function _(){const r=document.getElementById("toggle-results-chart"),n=document.getElementById("chart-publish-status"),e=b?.status==="closed",t=e&&b?.show_results_chart===!0;r.disabled=!e,r.textContent=t?"HIDE RESULTS CHART":"ENABLE RESULTS CHART",n.textContent=t?"PUBLIC: Chart is visible on the voting website.":e?"PUBLIC: Chart is hidden. Enable it when you are ready.":"PUBLIC: Chart is hidden. Save voting status as CLOSED first."}function I(r){document.getElementById("login").hidden=r,document.getElementById("dashboard").hidden=!r}function c(r){return document.getElementById(r).value.trim()}const T="nadanu-finalists",G=5*1024*1024,$={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"},S=new Map;function y(r,n,e=""){const t=document.getElementById(r),a=document.getElementById(n),s=S.get(n);s&&URL.revokeObjectURL(s),S.delete(n);const o=t.files?.[0];if(o){const u=URL.createObjectURL(o);S.set(n,u),a.src=u,a.hidden=!1}else e?(a.src=e,a.hidden=!1):(a.removeAttribute("src"),a.hidden=!0)}for(const[r,n,e]of[["image-file","image-preview","image-url"],["edit-image-file","edit-image-preview","edit-image-url"]])document.getElementById(r).addEventListener("change",()=>{y(r,n,document.getElementById(e).value)}),document.getElementById(e).addEventListener("change",()=>{document.getElementById(r).files?.length||y(r,n,document.getElementById(e).value)});async function O(r){if(!r)return null;const n=$[r.type];if(!n)throw new Error("Please select a JPG, PNG or WebP photo.");if(r.size<1||r.size>G)throw new Error("Finalist photo must be smaller than 5 MB.");if(!await g())throw new Error("Only organizers can upload photos.");const e=`finalists/${crypto.randomUUID()}.${n}`,{error:t}=await d.storage.from(T).upload(e,r,{cacheControl:"3600",contentType:r.type,upsert:!1});if(t)throw t;const{data:a}=d.storage.from(T).getPublicUrl(e);if(!a?.publicUrl)throw new Error("Photo uploaded, but public URL could not be created.");return{url:a.publicUrl,filePath:e}}async function C(r){if(r?.filePath)try{await d.storage.from(T).remove([r.filePath])}catch{}}function D(r){if(!r)return"";const n=new Date(r),e=t=>String(t).padStart(2,"0");return`${n.getFullYear()}-${e(n.getMonth()+1)}-${e(n.getDate())}T${e(n.getHours())}:${e(n.getMinutes())}`}async function g(){const{data:r,error:n}=await d.auth.getUser();if(n||!r?.user||r.user.is_anonymous)return!1;const{data:e,error:t}=await d.from("admin_roles").select("role").eq("user_id",r.user.id).maybeSingle();if(t)throw t;return!!e}async function p(){const[{data:r,error:n},{data:e,error:t},{data:a,error:s}]=await Promise.all([d.from("categories").select("id,slug,name").order("name"),d.from("contestants").select("id,name,stage_name,performance_title,image_url,sort_order,active,category_id").order("sort_order"),d.from("voting_events").select("id,status,starts_at,ends_at,show_results_chart").eq("id",1).maybeSingle()]);if(n||t||s)throw n||t||s;if(!a)throw new Error("Voting event not found. Check voting_events table.");b=a,_(),R=e||[],document.getElementById("edit-category").innerHTML=(r||[]).map(i=>`<option value="${m(i.id)}">${m(i.name)}</option>`).join("");const o=new Map((r||[]).map(i=>[i.id,i.name]));document.getElementById("category").innerHTML=(r||[]).map(i=>`<option value="${m(i.id)}">${m(i.name)}</option>`).join(""),document.getElementById("event-status").value=a.status,document.getElementById("starts-at").value=D(a.starts_at),document.getElementById("ends-at").value=D(a.ends_at),document.getElementById("finalists").innerHTML=e?.length?e.map(i=>`
        <div class="finalist-row">
          <div>
            <strong>${m(i.name)}</strong>
            <small>
              ${m(o.get(i.category_id)||"")}
              · ${m(i.stage_name||"")}
            </small>
          </div>

          <div class="finalist-actions">
            <button data-edit="${m(i.id)}" class="small-btn">EDIT</button>
            <button
              data-toggle="${m(i.id)}"
              data-state="${i.active}"
              class="small-btn">
              ${i.active?"HIDE":"SHOW"}
            </button>

            <button
              data-delete="${m(i.id)}"
              class="small-btn danger">
              DELETE
            </button>
          </div>
        </div>
      `).join(""):"<p>No finalists yet. Add one using the form above.</p>";const{data:u,error:w}=await d.rpc("admin_vote_results");w?document.getElementById("results").textContent="Results unavailable: "+w.message:document.getElementById("results").innerHTML=u?.length?u.map(i=>`
          <div class="result-row">
            <span>${m(i.name)}</span>
            <strong>${Number(i.vote_count)||0} VOTES</strong>
          </div>
        `).join(""):"<p>No votes yet.</p>"}if(!U)l("Supabase is not configured. Check your environment settings.","error"),document.querySelector("#login-form button").disabled=!0;else{document.getElementById("login-form").onsubmit=async n=>{n.preventDefault();const{error:e}=await d.auth.signInWithPassword({email:c("email"),password:c("password")});if(e){l(e.message,"error");return}try{if(!await g()){await d.auth.signOut(),l("This user is not an authorized Nadanu organizer.","error");return}I(!0),await p()}catch(t){l(t.message,"error")}},document.getElementById("logout").onclick=async()=>{await d.auth.signOut(),I(!1),l("Signed out.")},document.getElementById("event-form").onsubmit=async n=>{n.preventDefault();const e=c("event-status"),t=c("starts-at"),a=c("ends-at"),s=document.getElementById("save-status");if(!["draft","open","closed"].includes(e)){l("Invalid voting status.","error");return}if(t&&a&&new Date(a)<=new Date(t)){l("End date must be later than start date.","error");return}s.disabled=!0,s.textContent="SAVING STATUS…";try{if(!await g())throw new Error("Admin session expired. Please log in again.");const{data:o,error:u}=await d.from("voting_events").update({status:e,starts_at:t?new Date(t).toISOString():null,ends_at:a?new Date(a).toISOString():null,updated_at:new Date().toISOString()}).eq("id",1).select("id,status,starts_at,ends_at").maybeSingle();if(u)throw u;if(!o)throw new Error("Status was not saved. Check Supabase admin permissions and RLS policies.");if(o.status!==e)throw new Error("Saved status does not match the selected status.");if(await p(),c("event-status")!==e)throw new Error("Database status changed unexpectedly. Please reload.");l(`VOTING STATUS UPDATED TO ${e.toUpperCase()}.`,"success")}catch(o){l("Failed to save voting status: "+o.message,"error")}finally{s.disabled=!1,s.textContent="SAVE VOTING STATUS"}},document.getElementById("toggle-results-chart").onclick=async()=>{const n=document.getElementById("toggle-results-chart");if(!b||b.status!=="closed"){l("Close voting before publishing results.","error");return}const e=!b.show_results_chart;n.disabled=!0;try{if(!await g())throw new Error("Organizer login required.");const{data:t,error:a}=await d.from("voting_events").update({show_results_chart:e,updated_at:new Date().toISOString()}).eq("id",1).eq("status","closed").select("id,status,show_results_chart").maybeSingle();if(a)throw a;if(!t||t.status!=="closed"||t.show_results_chart!==e)throw new Error("Could not change public chart visibility. Refresh and retry.");await p(),l(e?"PUBLIC RESULTS CHART ENABLED.":"PUBLIC RESULTS CHART HIDDEN.","success")}catch(t){l("Chart setting failed: "+t.message,"error"),await p().catch(()=>{})}finally{_()}},document.getElementById("contestant-form").onsubmit=async n=>{n.preventDefault();const e=n.target.querySelector('button[type="submit"]');let t=null;e.disabled=!0,e.textContent="SAVING FINALIST…";try{if(!await g())throw new Error("Admin session expired.");const a=document.getElementById("image-file").files?.[0];t=await O(a);const{error:s}=await d.from("contestants").insert({category_id:c("category"),name:c("name"),stage_name:c("stage-name"),performance_title:c("performance-title"),image_url:t?.url||c("image-url")||null,sort_order:Number(c("sort-order")),active:!0});if(s)throw s;t=null,n.target.reset(),y("image-file","image-preview"),await p(),l("Finalist and photo saved successfully.","success")}catch(a){await C(t),l("Could not add finalist: "+a.message,"error")}finally{e.disabled=!1,e.textContent="ADD FINALIST ↗"}},document.getElementById("finalists").onclick=async n=>{const e=n.target.closest("[data-edit],[data-delete],[data-toggle]");if(e){if(e.dataset.edit){const t=R.find(s=>s.id===e.dataset.edit);if(!t)return;const a={"edit-id":t.id,"edit-category":t.category_id,"edit-name":t.name,"edit-stage-name":t.stage_name||"","edit-performance-title":t.performance_title||"","edit-image-url":t.image_url||"","edit-sort-order":t.sort_order};for(const[s,o]of Object.entries(a))document.getElementById(s).value=o;document.getElementById("edit-image-file").value="",y("edit-image-file","edit-image-preview",t.image_url||""),document.getElementById("edit-panel").hidden=!1,document.getElementById("edit-panel").scrollIntoView({behavior:"smooth"});return}try{if(!await g())throw new Error("Admin session expired.");let t;if(e.dataset.delete){if(!confirm("Delete this finalist? Existing votes may also be deleted."))return;({error:t}=await d.from("contestants").delete().eq("id",e.dataset.delete))}else({error:t}=await d.from("contestants").update({active:e.dataset.state!=="true"}).eq("id",e.dataset.toggle));if(t)throw t;await p(),l("Finalist updated.","success")}catch(t){l(t.message,"error")}}},document.getElementById("cancel-edit").onclick=()=>{document.getElementById("edit-panel").hidden=!0},document.getElementById("edit-form").onsubmit=async n=>{n.preventDefault();const e=n.target.querySelector('button[type="submit"]');let t=null;e.disabled=!0,e.textContent="SAVING CHANGES…";try{if(!await g())throw Error("Admin session expired. Sign in again.");const a=document.getElementById("edit-image-file").files?.[0];t=await O(a);const{data:s,error:o}=await d.from("contestants").update({category_id:c("edit-category"),name:c("edit-name"),stage_name:c("edit-stage-name"),performance_title:c("edit-performance-title"),image_url:t?.url||c("edit-image-url")||null,sort_order:Number(c("edit-sort-order"))}).eq("id",c("edit-id")).select("id").maybeSingle();if(o)throw o;if(!s)throw Error("Finalist was not updated. Check admin access.");t=null,document.getElementById("edit-panel").hidden=!0,document.getElementById("edit-image-file").value="",y("edit-image-file","edit-image-preview"),await p(),l("Finalist photo and details updated successfully.","success")}catch(a){await C(t),l("Could not update finalist: "+a.message,"error")}finally{e.disabled=!1,e.textContent="SAVE CHANGES"}};async function r(){if(!await g())throw Error("Admin session expired.");const{data:n,error:e}=await d.rpc("admin_list_voter_records");if(e)throw e;v=n||[],document.getElementById("voter-records").innerHTML=v.length?v.map(t=>`<div class="finalist-row"><div><strong>${m(t.finalist_name)}</strong><small>${m(new Date(t.voted_at).toLocaleString())} · Device ref: ${m(t.device_reference)}</small></div><button class="small-btn danger" type="button" data-reset="${m(t.vote_id)}">RESET VOTE</button></div>`).join(""):"<p>No votes recorded.</p>"}document.getElementById("load-votes").onclick=async()=>{const n=document.getElementById("load-votes"),e=document.getElementById("voter-records"),t=document.getElementById("reset-form");if(!e.hidden){e.hidden=!0,t.hidden=!0,document.getElementById("reset-password").value="",n.textContent="VIEW VOTED DEVICES",n.setAttribute("aria-expanded","false");return}n.disabled=!0,n.textContent="LOADING DEVICES…";try{await r(),e.hidden=!1,n.textContent="HIDE VOTED DEVICES",n.setAttribute("aria-expanded","true")}catch(a){e.hidden=!0,n.textContent="VIEW VOTED DEVICES",l(a.message,"error")}finally{n.disabled=!1}},document.getElementById("voter-records").onclick=n=>{const e=n.target.closest("[data-reset]");if(!e)return;const t=v.find(a=>a.vote_id===e.dataset.reset);t&&(document.getElementById("reset-vote-id").value=t.vote_id,document.getElementById("reset-selection").textContent="Selected: "+t.finalist_name+" · "+new Date(t.voted_at).toLocaleString()+" · "+t.device_reference,document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!1)},document.getElementById("cancel-reset").onclick=()=>{document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!0},document.getElementById("reset-form").onsubmit=async n=>{n.preventDefault();const e=c("reset-vote-id");if(!v.some(a=>a.vote_id===e)){l("Invalid selected vote.","error");return}if(!confirm("Permanently reset only the selected vote? This allows the browser/session to vote again and is audit logged."))return;const t=document.getElementById("confirm-reset");t.disabled=!0;try{if(!await g())throw Error("Admin session expired.");const{data:a,error:s}=await d.functions.invoke("admin-reset-vote",{body:{vote_id:e,email:c("reset-email"),password:c("reset-password")}});if(s){let o=s.message;try{o=(await s.context?.json())?.error||o}catch{}throw Error(o)}if(!a?.ok)throw Error(a?.error||"Reset was not confirmed.");document.getElementById("reset-form").hidden=!0,await p(),await r(),l("Selected vote reset. Audit log updated.","success")}catch(a){l("Vote reset failed: "+a.message,"error")}finally{t.disabled=!1,document.getElementById("reset-password").value=""}},document.getElementById("download-results-pdf").onclick=async()=>{const n=document.getElementById("download-results-pdf");n.disabled=!0,n.textContent="PREPARING RESULTS PDF…";try{if(!await g())throw new Error("Organizer login required.");const[e,t,a]=await Promise.all([d.rpc("admin_vote_results"),d.from("contestants").select("id,name,category_id"),d.from("categories").select("id,name")]);if(e.error)throw e.error;if(t.error)throw t.error;if(a.error)throw a.error;const{downloadVotingResultsPdf:s}=await x(async()=>{const{downloadVotingResultsPdf:o}=await import("./results-pdf-KE6giK8r.js");return{downloadVotingResultsPdf:o}},[]);await s({results:e.data||[],contestants:t.data||[],categories:a.data||[]}),l("OFFICIAL NADANU 3.0 VOTING RESULTS PDF DOWNLOADED.","success")}catch(e){l("Could not download voting results PDF: "+(e?.message||"Unknown error"),"error")}finally{n.disabled=!1,n.textContent="DOWNLOAD VOTING RESULTS PDF ↓"}},document.getElementById("refresh").onclick=()=>p().catch(n=>l(n.message,"error")),g().then(async n=>{n&&(I(!0),await p())}).catch(n=>{l(n.message,"error")})}
