import{l as O,f as D,c as _,s,a as c,b as m}from"./shared-DZpYu_n7.js";const N="modulepreload",R=function(d){return"/nadanu-voting/"+d},w={},L=function(n,e,t){let r=Promise.resolve();if(e&&e.length>0){let h=function(a){return Promise.all(a.map(E=>Promise.resolve(E).then(b=>({status:"fulfilled",value:b}),b=>({status:"rejected",reason:b}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),u=o?.nonce||o?.getAttribute("nonce");r=h(e.map(a=>{if(a=R(a),a in w)return;w[a]=!0;const E=a.endsWith(".css"),b=E?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${b}`))return;const p=document.createElement("link");if(p.rel=E?"stylesheet":N,E||(p.as="script"),p.crossOrigin="",p.href=a,u&&p.setAttribute("nonce",u),document.head.appendChild(p),E)return new Promise((T,A)=>{p.addEventListener("load",T),p.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${a}`)))})}))}function l(o){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=o,window.dispatchEvent(u),!u.defaultPrevented)throw o}return r.then(o=>{for(const u of o||[])u.status==="rejected"&&l(u.reason);return n().catch(l)})},B=document.getElementById("app");B.innerHTML=`
<div class="site-noise"></div>

<header class="topbar">
  <div class="wrap topbar-inner">
    ${O()}
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
            PHOTO URL (OPTIONAL)
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
        <label>PHOTO URL<input id="edit-image-url" type="url"/></label>
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

${D()}
`;let S=[],v=[];function y(d){document.getElementById("login").hidden=d,document.getElementById("dashboard").hidden=!d}function i(d){return document.getElementById(d).value.trim()}function I(d){if(!d)return"";const n=new Date(d),e=t=>String(t).padStart(2,"0");return`${n.getFullYear()}-${e(n.getMonth()+1)}-${e(n.getDate())}T${e(n.getHours())}:${e(n.getMinutes())}`}async function g(){const{data:d,error:n}=await c.auth.getUser();if(n||!d?.user||d.user.is_anonymous)return!1;const{data:e,error:t}=await c.from("admin_roles").select("role").eq("user_id",d.user.id).maybeSingle();if(t)throw t;return!!e}async function f(){const[{data:d,error:n},{data:e,error:t},{data:r,error:l}]=await Promise.all([c.from("categories").select("id,slug,name").order("name"),c.from("contestants").select("id,name,stage_name,performance_title,image_url,sort_order,active,category_id").order("sort_order"),c.from("voting_events").select("id,status,starts_at,ends_at").eq("id",1).maybeSingle()]);if(n||t||l)throw n||t||l;if(!r)throw new Error("Voting event not found. Check voting_events table.");S=e||[],document.getElementById("edit-category").innerHTML=(d||[]).map(a=>`<option value="${m(a.id)}">${m(a.name)}</option>`).join("");const o=new Map((d||[]).map(a=>[a.id,a.name]));document.getElementById("category").innerHTML=(d||[]).map(a=>`<option value="${m(a.id)}">${m(a.name)}</option>`).join(""),document.getElementById("event-status").value=r.status,document.getElementById("starts-at").value=I(r.starts_at),document.getElementById("ends-at").value=I(r.ends_at),document.getElementById("finalists").innerHTML=e?.length?e.map(a=>`
        <div class="finalist-row">
          <div>
            <strong>${m(a.name)}</strong>
            <small>
              ${m(o.get(a.category_id)||"")}
              · ${m(a.stage_name||"")}
            </small>
          </div>

          <div class="finalist-actions">
            <button data-edit="${m(a.id)}" class="small-btn">EDIT</button>
            <button
              data-toggle="${m(a.id)}"
              data-state="${a.active}"
              class="small-btn">
              ${a.active?"HIDE":"SHOW"}
            </button>

            <button
              data-delete="${m(a.id)}"
              class="small-btn danger">
              DELETE
            </button>
          </div>
        </div>
      `).join(""):"<p>No finalists yet. Add one using the form above.</p>";const{data:u,error:h}=await c.rpc("admin_vote_results");h?document.getElementById("results").textContent="Results unavailable: "+h.message:document.getElementById("results").innerHTML=u?.length?u.map(a=>`
          <div class="result-row">
            <span>${m(a.name)}</span>
            <strong>${Number(a.vote_count)||0} VOTES</strong>
          </div>
        `).join(""):"<p>No votes yet.</p>"}if(!_)s("Supabase is not configured. Check your environment settings.","error"),document.querySelector("#login-form button").disabled=!0;else{document.getElementById("login-form").onsubmit=async n=>{n.preventDefault();const{error:e}=await c.auth.signInWithPassword({email:i("email"),password:i("password")});if(e){s(e.message,"error");return}try{if(!await g()){await c.auth.signOut(),s("This user is not an authorized Nadanu organizer.","error");return}y(!0),await f()}catch(t){s(t.message,"error")}},document.getElementById("logout").onclick=async()=>{await c.auth.signOut(),y(!1),s("Signed out.")},document.getElementById("event-form").onsubmit=async n=>{n.preventDefault();const e=i("event-status"),t=i("starts-at"),r=i("ends-at"),l=document.getElementById("save-status");if(!["draft","open","closed"].includes(e)){s("Invalid voting status.","error");return}if(t&&r&&new Date(r)<=new Date(t)){s("End date must be later than start date.","error");return}l.disabled=!0,l.textContent="SAVING STATUS…";try{if(!await g())throw new Error("Admin session expired. Please log in again.");const{data:o,error:u}=await c.from("voting_events").update({status:e,starts_at:t?new Date(t).toISOString():null,ends_at:r?new Date(r).toISOString():null,updated_at:new Date().toISOString()}).eq("id",1).select("id,status,starts_at,ends_at").maybeSingle();if(u)throw u;if(!o)throw new Error("Status was not saved. Check Supabase admin permissions and RLS policies.");if(o.status!==e)throw new Error("Saved status does not match the selected status.");if(await f(),i("event-status")!==e)throw new Error("Database status changed unexpectedly. Please reload.");s(`VOTING STATUS UPDATED TO ${e.toUpperCase()}.`,"success")}catch(o){s("Failed to save voting status: "+o.message,"error")}finally{l.disabled=!1,l.textContent="SAVE VOTING STATUS"}},document.getElementById("contestant-form").onsubmit=async n=>{n.preventDefault();try{if(!await g())throw new Error("Admin session expired.");const{error:e}=await c.from("contestants").insert({category_id:i("category"),name:i("name"),stage_name:i("stage-name"),performance_title:i("performance-title"),image_url:i("image-url")||null,sort_order:Number(i("sort-order")),active:!0});if(e)throw e;n.target.reset(),await f(),s("Finalist added.","success")}catch(e){s(e.message,"error")}},document.getElementById("finalists").onclick=async n=>{const e=n.target.closest("[data-edit],[data-delete],[data-toggle]");if(e){if(e.dataset.edit){const t=S.find(l=>l.id===e.dataset.edit);if(!t)return;const r={"edit-id":t.id,"edit-category":t.category_id,"edit-name":t.name,"edit-stage-name":t.stage_name||"","edit-performance-title":t.performance_title||"","edit-image-url":t.image_url||"","edit-sort-order":t.sort_order};for(const[l,o]of Object.entries(r))document.getElementById(l).value=o;document.getElementById("edit-panel").hidden=!1,document.getElementById("edit-panel").scrollIntoView({behavior:"smooth"});return}try{if(!await g())throw new Error("Admin session expired.");let t;if(e.dataset.delete){if(!confirm("Delete this finalist? Existing votes may also be deleted."))return;({error:t}=await c.from("contestants").delete().eq("id",e.dataset.delete))}else({error:t}=await c.from("contestants").update({active:e.dataset.state!=="true"}).eq("id",e.dataset.toggle));if(t)throw t;await f(),s("Finalist updated.","success")}catch(t){s(t.message,"error")}}},document.getElementById("cancel-edit").onclick=()=>{document.getElementById("edit-panel").hidden=!0},document.getElementById("edit-form").onsubmit=async n=>{n.preventDefault();try{if(!await g())throw Error("Admin session expired. Sign in again.");const{data:e,error:t}=await c.from("contestants").update({category_id:i("edit-category"),name:i("edit-name"),stage_name:i("edit-stage-name"),performance_title:i("edit-performance-title"),image_url:i("edit-image-url")||null,sort_order:Number(i("edit-sort-order"))}).eq("id",i("edit-id")).select("id").maybeSingle();if(t)throw t;if(!e)throw Error("Finalist was not updated. Check admin access.");document.getElementById("edit-panel").hidden=!0,await f(),s("Finalist updated successfully.","success")}catch(e){s(e.message,"error")}};async function d(){if(!await g())throw Error("Admin session expired.");const{data:n,error:e}=await c.rpc("admin_list_voter_records");if(e)throw e;v=n||[],document.getElementById("voter-records").innerHTML=v.length?v.map(t=>`<div class="finalist-row"><div><strong>${m(t.finalist_name)}</strong><small>${m(new Date(t.voted_at).toLocaleString())} · Device ref: ${m(t.device_reference)}</small></div><button class="small-btn danger" type="button" data-reset="${m(t.vote_id)}">RESET VOTE</button></div>`).join(""):"<p>No votes recorded.</p>"}document.getElementById("load-votes").onclick=async()=>{const n=document.getElementById("load-votes"),e=document.getElementById("voter-records"),t=document.getElementById("reset-form");if(!e.hidden){e.hidden=!0,t.hidden=!0,document.getElementById("reset-password").value="",n.textContent="VIEW VOTED DEVICES",n.setAttribute("aria-expanded","false");return}n.disabled=!0,n.textContent="LOADING DEVICES…";try{await d(),e.hidden=!1,n.textContent="HIDE VOTED DEVICES",n.setAttribute("aria-expanded","true")}catch(r){e.hidden=!0,n.textContent="VIEW VOTED DEVICES",s(r.message,"error")}finally{n.disabled=!1}},document.getElementById("voter-records").onclick=n=>{const e=n.target.closest("[data-reset]");if(!e)return;const t=v.find(r=>r.vote_id===e.dataset.reset);t&&(document.getElementById("reset-vote-id").value=t.vote_id,document.getElementById("reset-selection").textContent="Selected: "+t.finalist_name+" · "+new Date(t.voted_at).toLocaleString()+" · "+t.device_reference,document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!1)},document.getElementById("cancel-reset").onclick=()=>{document.getElementById("reset-password").value="",document.getElementById("reset-form").hidden=!0},document.getElementById("reset-form").onsubmit=async n=>{n.preventDefault();const e=i("reset-vote-id");if(!v.some(r=>r.vote_id===e)){s("Invalid selected vote.","error");return}if(!confirm("Permanently reset only the selected vote? This allows the browser/session to vote again and is audit logged."))return;const t=document.getElementById("confirm-reset");t.disabled=!0;try{if(!await g())throw Error("Admin session expired.");const{data:r,error:l}=await c.functions.invoke("admin-reset-vote",{body:{vote_id:e,email:i("reset-email"),password:i("reset-password")}});if(l){let o=l.message;try{o=(await l.context?.json())?.error||o}catch{}throw Error(o)}if(!r?.ok)throw Error(r?.error||"Reset was not confirmed.");document.getElementById("reset-form").hidden=!0,await f(),await d(),s("Selected vote reset. Audit log updated.","success")}catch(r){s("Vote reset failed: "+r.message,"error")}finally{t.disabled=!1,document.getElementById("reset-password").value=""}},document.getElementById("download-results-pdf").onclick=async()=>{const n=document.getElementById("download-results-pdf");n.disabled=!0,n.textContent="PREPARING RESULTS PDF…";try{if(!await g())throw new Error("Organizer login required.");const[e,t,r]=await Promise.all([c.rpc("admin_vote_results"),c.from("contestants").select("id,name,category_id"),c.from("categories").select("id,name")]);if(e.error)throw e.error;if(t.error)throw t.error;if(r.error)throw r.error;const{downloadVotingResultsPdf:l}=await L(async()=>{const{downloadVotingResultsPdf:o}=await import("./results-pdf-KE6giK8r.js");return{downloadVotingResultsPdf:o}},[]);await l({results:e.data||[],contestants:t.data||[],categories:r.data||[]}),s("OFFICIAL NADANU 3.0 VOTING RESULTS PDF DOWNLOADED.","success")}catch(e){s("Could not download voting results PDF: "+(e?.message||"Unknown error"),"error")}finally{n.disabled=!1,n.textContent="DOWNLOAD VOTING RESULTS PDF ↓"}},document.getElementById("refresh").onclick=()=>f().catch(n=>s(n.message,"error")),g().then(async n=>{n&&(y(!0),await f())}).catch(n=>{s(n.message,"error")})}
