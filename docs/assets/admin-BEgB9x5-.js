import{l as R,f as L,c as P,s as d,a as c,b as m}from"./shared-C4YcSOgO.js";const C="modulepreload",V=function(r){return"/nadanu-voting/"+r},T={},U=function(n,e,t){let a=Promise.resolve();if(e&&e.length>0){let y=function(i){return Promise.all(i.map(E=>Promise.resolve(E).then(b=>({status:"fulfilled",value:b}),b=>({status:"rejected",reason:b}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),u=s?.nonce||s?.getAttribute("nonce");a=y(e.map(i=>{if(i=V(i),i in T)return;T[i]=!0;const E=i.endsWith(".css"),b=E?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${b}`))return;const p=document.createElement("link");if(p.rel=E?"stylesheet":C,E||(p.as="script"),p.crossOrigin="",p.href=i,u&&p.setAttribute("nonce",u),document.head.appendChild(p),E)return new Promise((_,B)=>{p.addEventListener("load",_),p.addEventListener("error",()=>B(new Error(`Unable to preload CSS for ${i}`)))})}))}function o(s){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=s,window.dispatchEvent(u),!u.defaultPrevented)throw s}return a.then(s=>{for(const u of s||[])u.status==="rejected"&&o(u.reason);return n().catch(o)})},M=document.getElementById("app");M.innerHTML=`
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${R()}
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

${L()}
`;let N=[],v=[];function w(r){document.getElementById("login").hidden=r,document.getElementById("dashboard").hidden=!r}function l(r){return document.getElementById(r).value.trim()}const S="nadanu-finalists",F=5*1024*1024,G={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"},I=new Map;function h(r,n,e=""){const t=document.getElementById(r),a=document.getElementById(n),o=I.get(n);o&&URL.revokeObjectURL(o),I.delete(n);const s=t.files?.[0];if(s){const u=URL.createObjectURL(s);I.set(n,u),a.src=u,a.hidden=!1}else e?(a.src=e,a.hidden=!1):(a.removeAttribute("src"),a.hidden=!0)}for(const[r,n,e]of[["image-file","image-preview","image-url"],["edit-image-file","edit-image-preview","edit-image-url"]])document.getElementById(r).addEventListener("change",()=>{h(r,n,document.getElementById(e).value)}),document.getElementById(e).addEventListener("change",()=>{document.getElementById(r).files?.length||h(r,n,document.getElementById(e).value)});async function A(r){if(!r)return null;const n=G[r.type];if(!n)throw new Error("Please select a JPG, PNG or WebP photo.");if(r.size<1||r.size>F)throw new Error("Finalist photo must be smaller than 5 MB.");if(!await g())throw new Error("Only organizers can upload photos.");const e=`finalists/${crypto.randomUUID()}.${n}`,{error:t}=await c.storage.from(S).upload(e,r,{cacheControl:"3600",contentType:r.type,upsert:!1});if(t)throw t;const{data:a}=c.storage.from(S).getPublicUrl(e);if(!a?.publicUrl)throw new Error("Photo uploaded, but public URL could not be created.");return{url:a.publicUrl,filePath:e}}async function O(r){if(r?.filePath)try{await c.storage.from(S).remove([r.filePath])}catch{}}function D(r){if(!r)return"";const n=new Date(r),e=t=>String(t).padStart(2,"0");return`${n.getFullYear()}-${e(n.getMonth()+1)}-${e(n.getDate())}T${e(n.getHours())}:${e(n.getMinutes())}`}async function g(){const{data:r,error:n}=await c.auth.getUser();if(n||!r?.user||r.user.is_anonymous)return!1;const{data:e,error:t}=await c.from("admin_roles").select("role").eq("user_id",r.user.id).maybeSingle();if(t)throw t;return!!e}async function f(){const[{data:r,error:n},{data:e,error:t},{data:a,error:o}]=await Promise.all([c.from("categories").select("id,slug,name").order("name"),c.from("contestants").select("id,name,stage_name,performance_title,image_url,sort_order,active,category_id").order("sort_order"),c.from("voting_events").select("id,status,starts_at,ends_at").eq("id",1).maybeSingle()]);if(n||t||o)throw n||t||o;if(!a)throw new Error("Voting event not found. Check voting_events table.");N=e||[],document.getElementById("edit-category").innerHTML=(r||[]).map(i=>`<option value="${m(i.id)}">${m(i.name)}</option>`).join("");const s=new Map((r||[]).map(i=>[i.id,i.name]));document.getElementById("category").innerHTML=(r||[]).map(i=>`<option value="${m(i.id)}">${m(i.name)}</option>`).join(""),document.getElementById("event-status").value=a.status,document.getElementById("starts-at").value=D(a.starts_at),document.getElementById("ends-at").value=D(a.ends_at),document.getElementById("finalists").innerHTML=e?.length?e.map(i=>`
        <div class="finalist-row">
          <div>
            <strong>${m(i.name)}</strong>
            <small>
              ${m(s.get(i.category_id)||"")}
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
      `).join(""):"<p>No finalists yet. Add one using the form above.</p>";const{data:u,error:y}=await c.rpc("admin_vote_results");y?document.getElementById("results").textContent="Results unavailable: "+y.message:document.getElementById("results").innerHTML=u?.length?u.map(i=>`
          <div class="result-row">
            <span>${m(i.name)}</span>
            <strong>${Number(i.vote_count)||0} VOTES</strong>
          </div>
        `).join(""):"<p>No votes yet.</p>"}if(!P)d("Supabase is not configured. Check your environment settings.","error"),document.querySelector("#login-form button").disabled=!0;else{document.getElementById("login-form").onsubmit=async n=>{n.preventDefault();const{error:e}=await c.auth.signInWithPassword({email:l("email"),password:l("password")});if(e){d(e.message,"error");return}try{if(!await g()){await c.auth.signOut(),d("This user is not an authorized Nadanu organizer.","error");return}w(!0),await f()}catch(t){d(t.message,"error")}},document.getElementById("logout").onclick=async()=>{await c.auth.signOut(),w(!1),d("Signed out.")},document.getElementById("event-form").onsubmit=async n=>{n.preventDefault();const e=l("event-status"),t=l("starts-at"),a=l("ends-at"),o=document.getElementById("save-status");if(!["draft","open","closed"].includes(e)){d("Invalid voting status.","error");return}if(t&&a&&new Date(a)<=new Date(t)){d("End date must be later than start date.","error");return}o.disabled=!0,o.textContent="SAVING STATUS…";try{if(!await g())throw new Error("Admin session expired. Please log in again.");const{data:s,error:u}=await c.from("voting_events").update({status:e,starts_at:t?new Date(t).toISOString():null,ends_at:a?new Date(a).toISOString():null,updated_at:new Date().toISOString()}).eq("id",1).select("id,status,starts_at,ends_at").maybeSingle();if(u)throw u;if(!s)throw new Error("Status was not saved. Check Supabase admin permissions and RLS policies.");if(s.status!==e)throw new Error("Saved status does not match the selected status.");if(await f(),l("event-status")!==e)throw new Error("Database status changed unexpectedly. Please reload.");d(`VOTING STATUS UPDATED TO ${e.toUpperCase()}.`,"success")}catch(s){d("Failed to save voting status: "+s.message,"error")}finally{o.disabled=!1,o.textContent="SAVE VOTING STATUS"}},document.getElementById("contestant-form").onsubmit=async n=>{n.preventDefault();const e=n.target.querySelector('button[type="submit"]');let t=null;e.disabled=!0,e.textContent="SAVING FINALIST…";try{if(!await g())throw new Error("Admin session expired.");const a=document.getElementById("image-file").files?.[0];t=await A(a);const{error:o}=await c.from("contestants").insert({category_id:l("category"),name:l("name"),stage_name:l("stage-name"),performance_title:l("performance-title"),image_url:t?.url||l("image-url")||null,sort_order:Number(l("sort-order")),active:!0});if(o)throw o;t=null,n.target.reset(),h("image-file","image-preview"),await f(),d("Finalist and photo saved successfully.","success")}catch(a){await O(t),d("Could not add finalist: "+a.message,"error")}finally{e.disabled=!1,e.textContent="ADD FINALIST ↗"}},document.getElementById("finalists").onclick=async n=>{const e=n.target.closest("[data-edit],[data-delete],[data-toggle]");if(e){if(e.dataset.edit){const t=N.find(o=>o.id===e.dataset.edit);if(!t)return;const a={"edit-id":t.id,"edit-category":t.category_id,"edit-name":t.name,"edit-stage-name":t.stage_name||"","edit-performance-title":t.performance_title||"","edit-image-url":t.image_url||"","edit-sort-order":t.sort_order};for(const[o,s]of Object.entries(a))document.getElementById(o).value=s;document.getElementById("edit-image-file").value="",h("edit-image-file","edit-image-preview",t.image_url||""),document.getElementById("edit-panel").hidden=!1,document.getElementById("edit-panel").scrollIntoView({behavior:"smooth"});return}try{if(!await g())throw new Error("Admin session expired.");let t;if(e.dataset.delete){if(!confirm("Delete this finalist? Existing votes may also be deleted."))return;({error:t}=await c.from("contestants").delete().eq("id",e.dataset.delete))}else({error:t}=await c.from("contestants").update({active:e.dataset.state!=="true"}).eq("id",e.dataset.toggle));if(t)throw t;await f(),d("Finalist updated.","success")}catch(t){d(t.message,"error")}}},document.getElementById("cancel-edit").onclick=()=>{document.getElementById("edit-panel").hidden=!0},document.getElementById("edit-form").onsubmit=async n=>{n.preventDefault();const e=n.target.querySelector('button[type="submit"]');let t=null;e.disabled=!0,e.textContent="SAVING CHANGES…";try{if(!await g())throw Error("Admin session expired. Sign in again.");const a=document.getElementById("edit-image-file").files?.[0];t=await A(a);const{data:o,error:s}=await c.from("contestants").update({category_id:l("edit-category"),name:l("edit-name"),stage_name:l("edit-stage-name"),performance_title:l("edit-performance-title"),image_url:t?.url||l("edit-image-url")||null,sort_order:Number(l("edit-sort-order"))}).eq("id",l("edit-id")).select("id").maybeSingle();if(s)throw s;if(!o)throw Error("Finalist was not updated. Check admin access.");t=null,document.getElementById("edit-panel").hidden=!0,document.getElementById("edit-image-file").value="",h("edit-image-file","edit-image-preview"),await f(),d("Finalist photo and details updated successfully.","success")}catch(a){await O(t),d("Could not update finalist: "+a.message,"error")}finally{e.disabled=!1,e.textContent="SAVE CHANGES"}};async function r(){if(!await g())throw Error("Admin session expired.");const{data:n,error:e}=await c.rpc("admin_list_voter_records");if(e)throw e;v=n||[],document.getElementById("voter-records").innerHTML=v.length?v.map(t=>`<div class="finalist-row"><div><strong>${m(t.finalist_name)}</strong><small>${m(new Date(t.voted_at).toLocaleString())} · Device ref: ${m(t.device_reference)}</small></div><button class="small-btn danger" type="button" data-reset="${m(t.vote_id)}">RESET VOTE</button></div>`).join(""):"<p>No votes recorded.</p>"}document.getElementById("load-votes").onclick=async()=>{const n=document.getElementById("load-votes"),e=document.getElementById("voter-records"),t=document.getElementById("reset-form");if(!e.hidden){e.hidden=!0,t.hidden=!0,document.getElementById("reset-password").value="",n.textContent="VIEW VOTED DEVICES",n.setAttribute("aria-expanded","false");return}n.disabled=!0,n.textContent="LOADING DEVICES…";try{await r(),e.hidden=!1,n.textContent="HIDE VOTED DEVICES",n.setAttribute("aria-expanded","true")}catch(a){e.hidden=!0,n.textContent="VIEW VOTED DEVICES",d(a.message,"error")}finally{n.disabled=!1}},document.getElementById("voter-records").onclick=n=>{const e=n.target.closest("[data-reset]");if(!e)return;const t=v.find(a=>a.vote_id===e.dataset.reset);t&&(document.getElementById("reset-vote-id").value=t.vote_id,document.getElementById("reset-selection").textContent="Selected: "+t.finalist_name+" · "+new Date(t.voted_at).toLocaleString()+" · "+t.device_reference,document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!1)},document.getElementById("cancel-reset").onclick=()=>{document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!0},document.getElementById("reset-form").onsubmit=async n=>{n.preventDefault();const e=l("reset-vote-id");if(!v.some(a=>a.vote_id===e)){d("Invalid selected vote.","error");return}if(!confirm("Permanently reset only the selected vote? This allows the browser/session to vote again and is audit logged."))return;const t=document.getElementById("confirm-reset");t.disabled=!0;try{if(!await g())throw Error("Admin session expired.");const{data:a,error:o}=await c.functions.invoke("admin-reset-vote",{body:{vote_id:e,email:l("reset-email"),password:l("reset-password")}});if(o){let s=o.message;try{s=(await o.context?.json())?.error||s}catch{}throw Error(s)}if(!a?.ok)throw Error(a?.error||"Reset was not confirmed.");document.getElementById("reset-form").hidden=!0,await f(),await r(),d("Selected vote reset. Audit log updated.","success")}catch(a){d("Vote reset failed: "+a.message,"error")}finally{t.disabled=!1,document.getElementById("reset-password").value=""}},document.getElementById("download-results-pdf").onclick=async()=>{const n=document.getElementById("download-results-pdf");n.disabled=!0,n.textContent="PREPARING RESULTS PDF…";try{if(!await g())throw new Error("Organizer login required.");const[e,t,a]=await Promise.all([c.rpc("admin_vote_results"),c.from("contestants").select("id,name,category_id"),c.from("categories").select("id,name")]);if(e.error)throw e.error;if(t.error)throw t.error;if(a.error)throw a.error;const{downloadVotingResultsPdf:o}=await U(async()=>{const{downloadVotingResultsPdf:s}=await import("./results-pdf-KE6giK8r.js");return{downloadVotingResultsPdf:s}},[]);await o({results:e.data||[],contestants:t.data||[],categories:a.data||[]}),d("OFFICIAL NADANU 3.0 VOTING RESULTS PDF DOWNLOADED.","success")}catch(e){d("Could not download voting results PDF: "+(e?.message||"Unknown error"),"error")}finally{n.disabled=!1,n.textContent="DOWNLOAD VOTING RESULTS PDF ↓"}},document.getElementById("refresh").onclick=()=>f().catch(n=>d(n.message,"error")),g().then(async n=>{n&&(w(!0),await f())}).catch(n=>{d(n.message,"error")})}
