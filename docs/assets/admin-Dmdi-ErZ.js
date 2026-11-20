import{l as H,f as q,c as x,s as l,a as d,b as g}from"./shared-Cza-DTZ6.js";const k="modulepreload",j=function(s){return"/nadanu-voting/"+s},D={},W=function(n,e,t){let a=Promise.resolve();if(e&&e.length>0){let v=function(r){return Promise.all(r.map(E=>Promise.resolve(E).then(b=>({status:"fulfilled",value:b}),b=>({status:"rejected",reason:b}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),m=i?.nonce||i?.getAttribute("nonce");a=v(e.map(r=>{if(r=j(r),r in D)return;D[r]=!0;const E=r.endsWith(".css"),b=E?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${b}`))return;const c=document.createElement("link");if(c.rel=E?"stylesheet":k,E||(c.as="script"),c.crossOrigin="",c.href=r,m&&c.setAttribute("nonce",m),document.head.appendChild(c),E)return new Promise((f,w)=>{c.addEventListener("load",f),c.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${r}`)))})}))}function o(i){const m=new Event("vite:preloadError",{cancelable:!0});if(m.payload=i,window.dispatchEvent(m),!m.defaultPrevented)throw i}return a.then(i=>{for(const m of i||[])m.status==="rejected"&&o(m.reason);return n().catch(o)})},z=document.getElementById("app");z.innerHTML=`
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${H()}
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
      <div class="tiny-label">LIVE VOTE BAR CHART — ADMIN ONLY</div>
      <p class="chart-publish-note">Updates automatically every 15 seconds while Control Room is open. Public visitors cannot view these live counts.</p>
      <div id="admin-live-charts" class="results-charts" aria-live="off"></div>
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

${q()}
`;let B=[],S=[],y=null,F=new Map,C=!1;function G(s){const n=document.getElementById("admin-live-charts");n.replaceChildren();const e=new Map,t=new Map(B.map(a=>[a.id,a]));for(const a of s||[]){const o=t.get(a.contestant_id);if(!o)continue;const i=o.category_id;e.has(i)||e.set(i,[]),e.get(i).push({name:a.name,votes:Math.max(0,Number(a.vote_count)||0)})}for(const[a,o]of F){const i=(e.get(a)||[]).sort((c,f)=>f.votes-c.votes||c.name.localeCompare(f.name)),m=i.reduce((c,f)=>c+f.votes,0),v=Math.max(1,...i.map(c=>c.votes)),r=document.createElement("section");r.className="public-results-category";const E=document.createElement("h3");E.textContent=o;const b=document.createElement("p");b.className="public-results-total",b.textContent=m.toLocaleString()+" TOTAL VOTES",r.append(E,b);for(const c of i){const f=document.createElement("div");f.className="public-result-row";const w=document.createElement("div");w.className="public-result-details";const _=document.createElement("span");_.textContent=c.name;const A=document.createElement("strong");A.textContent=c.votes.toLocaleString()+" VOTES",w.append(_,A);const I=document.createElement("div");I.className="public-result-track",I.setAttribute("role","img"),I.setAttribute("aria-label",c.name+": "+A.textContent);const O=document.createElement("div");O.className="public-result-bar",O.style.width=Math.min(100,c.votes/v*100)+"%",I.append(O),f.append(w,I),r.append(f)}if(!i.length){const c=document.createElement("p");c.textContent="No finalists in this category.",r.append(c)}n.append(r)}}async function P(){if(!(!x||!d||C||document.hidden||document.getElementById("dashboard").hidden)){C=!0;try{const{data:s,error:n}=await d.rpc("admin_vote_results");if(n)throw n;G(s||[])}catch{document.getElementById("admin-live-charts").textContent="Live chart update unavailable. Use REFRESH RESULTS to retry."}finally{C=!1}}}function $(){const s=document.getElementById("toggle-results-chart"),n=document.getElementById("chart-publish-status"),e=y?.status==="closed",t=e&&y?.show_results_chart===!0;s.disabled=!e,s.textContent=t?"HIDE RESULTS CHART":"ENABLE RESULTS CHART",n.textContent=t?"PUBLIC: Chart is visible on the voting website.":e?"PUBLIC: Chart is hidden. Enable it when you are ready.":"PUBLIC: Chart is hidden. Save voting status as CLOSED first."}function L(s){document.getElementById("login").hidden=s,document.getElementById("dashboard").hidden=!s}function u(s){return document.getElementById(s).value.trim()}const R="nadanu-finalists",Y=5*1024*1024,J={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"},N=new Map;function T(s,n,e=""){const t=document.getElementById(s),a=document.getElementById(n),o=N.get(n);o&&URL.revokeObjectURL(o),N.delete(n);const i=t.files?.[0];if(i){const m=URL.createObjectURL(i);N.set(n,m),a.src=m,a.hidden=!1}else e?(a.src=e,a.hidden=!1):(a.removeAttribute("src"),a.hidden=!0)}for(const[s,n,e]of[["image-file","image-preview","image-url"],["edit-image-file","edit-image-preview","edit-image-url"]])document.getElementById(s).addEventListener("change",()=>{T(s,n,document.getElementById(e).value)}),document.getElementById(e).addEventListener("change",()=>{document.getElementById(s).files?.length||T(s,n,document.getElementById(e).value)});async function U(s){if(!s)return null;const n=J[s.type];if(!n)throw new Error("Please select a JPG, PNG or WebP photo.");if(s.size<1||s.size>Y)throw new Error("Finalist photo must be smaller than 5 MB.");if(!await p())throw new Error("Only organizers can upload photos.");const e=`finalists/${crypto.randomUUID()}.${n}`,{error:t}=await d.storage.from(R).upload(e,s,{cacheControl:"3600",contentType:s.type,upsert:!1});if(t)throw t;const{data:a}=d.storage.from(R).getPublicUrl(e);if(!a?.publicUrl)throw new Error("Photo uploaded, but public URL could not be created.");return{url:a.publicUrl,filePath:e}}async function V(s){if(s?.filePath)try{await d.storage.from(R).remove([s.filePath])}catch{}}function M(s){if(!s)return"";const n=new Date(s),e=t=>String(t).padStart(2,"0");return`${n.getFullYear()}-${e(n.getMonth()+1)}-${e(n.getDate())}T${e(n.getHours())}:${e(n.getMinutes())}`}async function p(){const{data:s,error:n}=await d.auth.getUser();if(n||!s?.user||s.user.is_anonymous)return!1;const{data:e,error:t}=await d.from("admin_roles").select("role").eq("user_id",s.user.id).maybeSingle();if(t)throw t;return!!e}async function h(){const[{data:s,error:n},{data:e,error:t},{data:a,error:o}]=await Promise.all([d.from("categories").select("id,slug,name").order("name"),d.from("contestants").select("id,name,stage_name,performance_title,image_url,sort_order,active,category_id").order("sort_order"),d.from("voting_events").select("id,status,starts_at,ends_at,show_results_chart").eq("id",1).maybeSingle()]);if(n||t||o)throw n||t||o;if(!a)throw new Error("Voting event not found. Check voting_events table.");y=a,$(),B=e||[],F=new Map((s||[]).map(r=>[r.id,r.name])),document.getElementById("edit-category").innerHTML=(s||[]).map(r=>`<option value="${g(r.id)}">${g(r.name)}</option>`).join("");const i=new Map((s||[]).map(r=>[r.id,r.name]));document.getElementById("category").innerHTML=(s||[]).map(r=>`<option value="${g(r.id)}">${g(r.name)}</option>`).join(""),document.getElementById("event-status").value=a.status,document.getElementById("starts-at").value=M(a.starts_at),document.getElementById("ends-at").value=M(a.ends_at),document.getElementById("finalists").innerHTML=e?.length?e.map(r=>`
        <div class="finalist-row">
          <div>
            <strong>${g(r.name)}</strong>
            <small>
              ${g(i.get(r.category_id)||"")}
              · ${g(r.stage_name||"")}
            </small>
          </div>

          <div class="finalist-actions">
            <button data-edit="${g(r.id)}" class="small-btn">EDIT</button>
            <button
              data-toggle="${g(r.id)}"
              data-state="${r.active}"
              class="small-btn">
              ${r.active?"HIDE":"SHOW"}
            </button>

            <button
              data-delete="${g(r.id)}"
              class="small-btn danger">
              DELETE
            </button>
          </div>
        </div>
      `).join(""):"<p>No finalists yet. Add one using the form above.</p>";const{data:m,error:v}=await d.rpc("admin_vote_results");v?(document.getElementById("admin-live-charts").textContent="Live chart unavailable.",document.getElementById("results").textContent="Results unavailable: "+v.message):(G(m||[]),document.getElementById("results").innerHTML=m?.length?m.map(r=>`
          <div class="result-row">
            <span>${g(r.name)}</span>
            <strong>${Number(r.vote_count)||0} VOTES</strong>
          </div>
        `).join(""):"<p>No votes yet.</p>")}if(!x)l("Supabase is not configured. Check your environment settings.","error"),document.querySelector("#login-form button").disabled=!0;else{document.getElementById("login-form").onsubmit=async n=>{n.preventDefault();const{error:e}=await d.auth.signInWithPassword({email:u("email"),password:u("password")});if(e){l(e.message,"error");return}try{if(!await p()){await d.auth.signOut(),l("This user is not an authorized Nadanu organizer.","error");return}L(!0),await h()}catch(t){l(t.message,"error")}},document.getElementById("logout").onclick=async()=>{await d.auth.signOut(),L(!1),l("Signed out.")},document.getElementById("event-form").onsubmit=async n=>{n.preventDefault();const e=u("event-status"),t=u("starts-at"),a=u("ends-at"),o=document.getElementById("save-status");if(!["draft","open","closed"].includes(e)){l("Invalid voting status.","error");return}if(t&&a&&new Date(a)<=new Date(t)){l("End date must be later than start date.","error");return}o.disabled=!0,o.textContent="SAVING STATUS…";try{if(!await p())throw new Error("Admin session expired. Please log in again.");const{data:i,error:m}=await d.from("voting_events").update({status:e,starts_at:t?new Date(t).toISOString():null,ends_at:a?new Date(a).toISOString():null,updated_at:new Date().toISOString()}).eq("id",1).select("id,status,starts_at,ends_at").maybeSingle();if(m)throw m;if(!i)throw new Error("Status was not saved. Check Supabase admin permissions and RLS policies.");if(i.status!==e)throw new Error("Saved status does not match the selected status.");if(await h(),u("event-status")!==e)throw new Error("Database status changed unexpectedly. Please reload.");l(`VOTING STATUS UPDATED TO ${e.toUpperCase()}.`,"success")}catch(i){l("Failed to save voting status: "+i.message,"error")}finally{o.disabled=!1,o.textContent="SAVE VOTING STATUS"}},document.getElementById("toggle-results-chart").onclick=async()=>{const n=document.getElementById("toggle-results-chart");if(!y||y.status!=="closed"){l("Close voting before publishing results.","error");return}const e=!y.show_results_chart;n.disabled=!0;try{if(!await p())throw new Error("Organizer login required.");const{data:t,error:a}=await d.from("voting_events").update({show_results_chart:e,updated_at:new Date().toISOString()}).eq("id",1).eq("status","closed").select("id,status,show_results_chart").maybeSingle();if(a)throw a;if(!t||t.status!=="closed"||t.show_results_chart!==e)throw new Error("Could not change public chart visibility. Refresh and retry.");await h(),l(e?"PUBLIC RESULTS CHART ENABLED.":"PUBLIC RESULTS CHART HIDDEN.","success")}catch(t){l("Chart setting failed: "+t.message,"error"),await h().catch(()=>{})}finally{$()}},document.getElementById("contestant-form").onsubmit=async n=>{n.preventDefault();const e=n.target.querySelector('button[type="submit"]');let t=null;e.disabled=!0,e.textContent="SAVING FINALIST…";try{if(!await p())throw new Error("Admin session expired.");const a=document.getElementById("image-file").files?.[0];t=await U(a);const{error:o}=await d.from("contestants").insert({category_id:u("category"),name:u("name"),stage_name:u("stage-name"),performance_title:u("performance-title"),image_url:t?.url||u("image-url")||null,sort_order:Number(u("sort-order")),active:!0});if(o)throw o;t=null,n.target.reset(),T("image-file","image-preview"),await h(),l("Finalist and photo saved successfully.","success")}catch(a){await V(t),l("Could not add finalist: "+a.message,"error")}finally{e.disabled=!1,e.textContent="ADD FINALIST ↗"}},document.getElementById("finalists").onclick=async n=>{const e=n.target.closest("[data-edit],[data-delete],[data-toggle]");if(e){if(e.dataset.edit){const t=B.find(o=>o.id===e.dataset.edit);if(!t)return;const a={"edit-id":t.id,"edit-category":t.category_id,"edit-name":t.name,"edit-stage-name":t.stage_name||"","edit-performance-title":t.performance_title||"","edit-image-url":t.image_url||"","edit-sort-order":t.sort_order};for(const[o,i]of Object.entries(a))document.getElementById(o).value=i;document.getElementById("edit-image-file").value="",T("edit-image-file","edit-image-preview",t.image_url||""),document.getElementById("edit-panel").hidden=!1,document.getElementById("edit-panel").scrollIntoView({behavior:"smooth"});return}try{if(!await p())throw new Error("Admin session expired.");let t;if(e.dataset.delete){if(!confirm("Delete this finalist? Existing votes may also be deleted."))return;({error:t}=await d.from("contestants").delete().eq("id",e.dataset.delete))}else({error:t}=await d.from("contestants").update({active:e.dataset.state!=="true"}).eq("id",e.dataset.toggle));if(t)throw t;await h(),l("Finalist updated.","success")}catch(t){l(t.message,"error")}}},document.getElementById("cancel-edit").onclick=()=>{document.getElementById("edit-panel").hidden=!0},document.getElementById("edit-form").onsubmit=async n=>{n.preventDefault();const e=n.target.querySelector('button[type="submit"]');let t=null;e.disabled=!0,e.textContent="SAVING CHANGES…";try{if(!await p())throw Error("Admin session expired. Sign in again.");const a=document.getElementById("edit-image-file").files?.[0];t=await U(a);const{data:o,error:i}=await d.from("contestants").update({category_id:u("edit-category"),name:u("edit-name"),stage_name:u("edit-stage-name"),performance_title:u("edit-performance-title"),image_url:t?.url||u("edit-image-url")||null,sort_order:Number(u("edit-sort-order"))}).eq("id",u("edit-id")).select("id").maybeSingle();if(i)throw i;if(!o)throw Error("Finalist was not updated. Check admin access.");t=null,document.getElementById("edit-panel").hidden=!0,document.getElementById("edit-image-file").value="",T("edit-image-file","edit-image-preview"),await h(),l("Finalist photo and details updated successfully.","success")}catch(a){await V(t),l("Could not update finalist: "+a.message,"error")}finally{e.disabled=!1,e.textContent="SAVE CHANGES"}};async function s(){if(!await p())throw Error("Admin session expired.");const{data:n,error:e}=await d.rpc("admin_list_voter_records");if(e)throw e;S=n||[],document.getElementById("voter-records").innerHTML=S.length?S.map(t=>`<div class="finalist-row"><div><strong>${g(t.finalist_name)}</strong><small>${g(new Date(t.voted_at).toLocaleString())} · Device ref: ${g(t.device_reference)}</small></div><button class="small-btn danger" type="button" data-reset="${g(t.vote_id)}">RESET VOTE</button></div>`).join(""):"<p>No votes recorded.</p>"}document.getElementById("load-votes").onclick=async()=>{const n=document.getElementById("load-votes"),e=document.getElementById("voter-records"),t=document.getElementById("reset-form");if(!e.hidden){e.hidden=!0,t.hidden=!0,document.getElementById("reset-password").value="",n.textContent="VIEW VOTED DEVICES",n.setAttribute("aria-expanded","false");return}n.disabled=!0,n.textContent="LOADING DEVICES…";try{await s(),e.hidden=!1,n.textContent="HIDE VOTED DEVICES",n.setAttribute("aria-expanded","true")}catch(a){e.hidden=!0,n.textContent="VIEW VOTED DEVICES",l(a.message,"error")}finally{n.disabled=!1}},document.getElementById("voter-records").onclick=n=>{const e=n.target.closest("[data-reset]");if(!e)return;const t=S.find(a=>a.vote_id===e.dataset.reset);t&&(document.getElementById("reset-vote-id").value=t.vote_id,document.getElementById("reset-selection").textContent="Selected: "+t.finalist_name+" · "+new Date(t.voted_at).toLocaleString()+" · "+t.device_reference,document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!1)},document.getElementById("cancel-reset").onclick=()=>{document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!0},document.getElementById("reset-form").onsubmit=async n=>{n.preventDefault();const e=u("reset-vote-id");if(!S.some(a=>a.vote_id===e)){l("Invalid selected vote.","error");return}if(!confirm("Permanently reset only the selected vote? This allows the browser/session to vote again and is audit logged."))return;const t=document.getElementById("confirm-reset");t.disabled=!0;try{if(!await p())throw Error("Admin session expired.");const{data:a,error:o}=await d.functions.invoke("admin-reset-vote",{body:{vote_id:e,email:u("reset-email"),password:u("reset-password")}});if(o){let i=o.message;try{i=(await o.context?.json())?.error||i}catch{}throw Error(i)}if(!a?.ok)throw Error(a?.error||"Reset was not confirmed.");document.getElementById("reset-form").hidden=!0,await h(),await s(),l("Selected vote reset. Audit log updated.","success")}catch(a){l("Vote reset failed: "+a.message,"error")}finally{t.disabled=!1,document.getElementById("reset-password").value=""}},document.getElementById("download-results-pdf").onclick=async()=>{const n=document.getElementById("download-results-pdf");n.disabled=!0,n.textContent="PREPARING RESULTS PDF…";try{if(!await p())throw new Error("Organizer login required.");const[e,t,a]=await Promise.all([d.rpc("admin_vote_results"),d.from("contestants").select("id,name,category_id"),d.from("categories").select("id,name")]);if(e.error)throw e.error;if(t.error)throw t.error;if(a.error)throw a.error;const{downloadVotingResultsPdf:o}=await W(async()=>{const{downloadVotingResultsPdf:i}=await import("./results-pdf-KE6giK8r.js");return{downloadVotingResultsPdf:i}},[]);await o({results:e.data||[],contestants:t.data||[],categories:a.data||[]}),l("OFFICIAL NADANU 3.0 VOTING RESULTS PDF DOWNLOADED.","success")}catch(e){l("Could not download voting results PDF: "+(e?.message||"Unknown error"),"error")}finally{n.disabled=!1,n.textContent="DOWNLOAD VOTING RESULTS PDF ↓"}},document.getElementById("refresh").onclick=()=>h().catch(n=>l(n.message,"error")),setInterval(()=>{P()},15e3),document.addEventListener("visibilitychange",()=>{document.hidden||P()}),p().then(async n=>{n&&(L(!0),await h())}).catch(n=>{l(n.message,"error")})}
