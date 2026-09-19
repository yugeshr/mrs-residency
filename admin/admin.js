const loginView = document.querySelector('[data-login-view]');
const adminShell = document.querySelector('[data-admin-shell]');
const loginForm = document.querySelector('[data-login-form]');
const loginError = document.querySelector('[data-login-error]');
const editor = document.querySelector('[data-editor]');
const saveButton = document.querySelector('[data-save]');
const saveState = document.querySelector('[data-save-state]');
const toast = document.querySelector('[data-toast]');

let siteContent;
let dirty = false;
let toastTimer;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const getValue = (path) => path.split('.').reduce((value, key) => value?.[key], siteContent);

const setValue = (path, value) => {
  const keys = path.split('.');
  const finalKey = keys.pop();
  const target = keys.reduce((object, key) => object[key], siteContent);
  target[finalKey] = value;
  markDirty();
};

function markDirty() {
  dirty = true;
  saveState.textContent = 'Unsaved changes';
  saveState.classList.add('unsaved');
}

function markSaved() {
  dirty = false;
  saveState.textContent = 'All changes saved';
  saveState.classList.remove('unsaved');
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 4200);
}

function textField(path, label, options = {}) {
  const value = getValue(path) ?? '';
  const wide = options.wide ? ' field-wide' : '';
  const help = options.help ? `<span class="help">${escapeHtml(options.help)}</span>` : '';
  if (options.textarea) {
    return `<label class="field${wide}">${escapeHtml(label)}<textarea data-path="${path}" rows="${options.rows || 3}">${escapeHtml(value)}</textarea>${help}</label>`;
  }
  return `<label class="field${wide}">${escapeHtml(label)}<input type="${options.type || 'text'}" data-path="${path}" value="${escapeHtml(value)}">${help}</label>`;
}

function imageField(path, label) {
  const value = getValue(path) || '';
  const source = value.startsWith('http') ? value : `/${value.replace(/^\/+/, '')}`;
  return `<div class="image-field">
    <img class="image-preview" src="${escapeHtml(source)}" alt="" loading="lazy">
    <div class="image-inputs">
      <label class="field">${escapeHtml(label)}<input data-path="${path}" value="${escapeHtml(value)}"></label>
      <label class="secondary-button upload-button">Upload new image<input type="file" accept="image/jpeg,image/png,image/webp" data-upload-path="${path}"></label>
      <span class="help">JPG, PNG or WebP, up to 3 MB.</span>
    </div>
  </div>`;
}

function panel(id, title, description, content, action = '') {
  return `<section class="panel" id="${id}">
    <div class="panel-heading"><div><h2>${title}</h2><p>${description}</p></div>${action}</div>
    ${content}
  </section>`;
}

function itemActions(collection, index) {
  return `<div class="item-actions">
    <button class="icon-button" type="button" data-action="up" data-collection="${collection}" data-index="${index}" aria-label="Move up">↑</button>
    <button class="icon-button" type="button" data-action="down" data-collection="${collection}" data-index="${index}" aria-label="Move down">↓</button>
    <button class="danger-button" type="button" data-action="remove" data-collection="${collection}" data-index="${index}">Remove</button>
  </div>`;
}

function roomsEditor() {
  return siteContent.rooms.items.map((room, index) => `<article class="collection-item">
    <div class="collection-top"><h3>Room ${index + 1}</h3>${itemActions('rooms.items', index)}</div>
    <div class="field-grid">
      ${textField(`rooms.items.${index}.name`, 'Room name')}
      ${textField(`rooms.items.${index}.price`, 'Price')}
      ${textField(`rooms.items.${index}.description`, 'Description', { wide: true })}
      ${imageField(`rooms.items.${index}.image`, 'Room image')}
      ${textField(`rooms.items.${index}.imageAlt`, 'Image description', { wide: true })}
      <label class="check-field"><input type="checkbox" data-feature-index="${index}" ${room.featured ? 'checked' : ''}> Feature this room</label>
    </div>
  </article>`).join('');
}

function galleryEditor() {
  return siteContent.gallery.images.map((item, index) => `<article class="collection-item">
    <div class="collection-top"><h3>Photo ${index + 1}</h3>${itemActions('gallery.images', index)}</div>
    <div class="field-grid">
      ${imageField(`gallery.images.${index}.src`, 'Gallery image')}
      ${textField(`gallery.images.${index}.label`, 'Category label')}
      ${textField(`gallery.images.${index}.caption`, 'Caption')}
      ${textField(`gallery.images.${index}.alt`, 'Image description', { wide: true })}
    </div>
  </article>`).join('');
}

function simpleCollection(path, fields, singularName) {
  return getValue(path).map((item, index) => `<article class="collection-item">
    <div class="collection-top"><h3>${singularName} ${index + 1}</h3>${itemActions(path, index)}</div>
    <div class="field-grid">${fields.map((field) => textField(`${path}.${index}.${field.key}`, field.label, field.options)).join('')}</div>
  </article>`).join('');
}

function stringCollection(path, singularName) {
  return getValue(path).map((_, index) => `<article class="collection-item">
    <div class="collection-top"><h3>${singularName} ${index + 1}</h3>${itemActions(path, index)}</div>
    ${textField(`${path}.${index}`, singularName)}
  </article>`).join('');
}

function renderEditor() {
  editor.innerHTML = [
    panel('general', 'General settings', 'Hotel identity, contact details and booking destinations.', `<div class="field-grid">
      ${textField('meta.title', 'Browser and search title', { wide: true })}
      ${textField('meta.description', 'Search description', { wide: true, textarea: true })}
      ${textField('hotel.name', 'Brand name')}
      ${textField('hotel.subtitle', 'Brand subtitle')}
      ${textField('hotel.phone', 'Display phone')}
      ${textField('hotel.phoneLink', 'Phone number for calls')}
      ${textField('hotel.email', 'Email', { type: 'email' })}
      ${textField('hotel.address', 'Address', { wide: true, textarea: true })}
      ${textField('hotel.bookingUrl', 'Booking URL', { wide: true, type: 'url' })}
      ${textField('hotel.mapsUrl', 'Google Maps URL', { wide: true, type: 'url' })}
      ${textField('hotel.whatsappUrl', 'WhatsApp URL', { wide: true, type: 'url' })}
    </div>`),
    panel('hero', 'Hero section', 'The first message and image guests see.', `<div class="field-grid">
      ${textField('hero.eyebrow', 'Eyebrow')}
      ${textField('hero.title', 'Heading', { wide: true, textarea: true, help: 'Use a new line to control the heading break.' })}
      ${textField('hero.description', 'Description', { wide: true, textarea: true })}
      ${imageField('hero.image', 'Hero image')}
      ${textField('hero.imageAlt', 'Image description', { wide: true })}
      <div class="field-wide collection">${simpleCollection('hero.facts', [{ key: 'value', label: 'Value' }, { key: 'label', label: 'Label' }], 'Highlight')}</div>
      <button class="secondary-button add-button" type="button" data-action="add" data-collection="hero.facts">Add highlight</button>
    </div>`),
    panel('intro', 'Introduction', 'Opening description and popular highlights.', `<div class="field-grid">
      ${textField('intro.kicker', 'Kicker')}
      ${textField('intro.title', 'Heading', { wide: true, textarea: true })}
      ${textField('intro.description', 'Description', { wide: true, textarea: true })}
      <div class="field-wide collection">${stringCollection('intro.highlights', 'Highlight')}</div>
      <button class="secondary-button add-button" type="button" data-action="add" data-collection="intro.highlights">Add highlight</button>
    </div>`),
    panel('rooms', 'Rooms & pricing', 'Add rooms, update rates and choose the featured room.', `<div class="field-grid">
      ${textField('rooms.kicker', 'Kicker')}
      ${textField('rooms.title', 'Heading')}
      ${textField('rooms.description', 'Description', { wide: true, textarea: true })}
      ${textField('rooms.rateNote', 'Rate note', { wide: true })}
      <div class="field-wide collection">${roomsEditor()}</div>
      <button class="secondary-button add-button" type="button" data-action="add" data-collection="rooms.items">Add room</button>
    </div>`),
    panel('gallery', 'Gallery', 'Manage the photos and captions in the website carousel.', `<div class="field-grid">
      ${textField('gallery.kicker', 'Kicker')}
      ${textField('gallery.title', 'Heading')}
      ${textField('gallery.description', 'Description', { wide: true, textarea: true })}
      <div class="field-wide collection">${galleryEditor()}</div>
      <button class="secondary-button add-button" type="button" data-action="add" data-collection="gallery.images">Add photo</button>
    </div>`),
    panel('amenities', 'Amenities', 'Update the services and facilities shown to guests.', `<div class="field-grid">
      ${textField('amenities.kicker', 'Kicker')}
      ${textField('amenities.title', 'Heading')}
      ${textField('amenities.description', 'Description', { wide: true, textarea: true })}
      <div class="field-wide collection">${simpleCollection('amenities.items', [{ key: 'title', label: 'Amenity' }, { key: 'description', label: 'Description', options: { wide: true } }], 'Amenity')}</div>
      <button class="secondary-button add-button" type="button" data-action="add" data-collection="amenities.items">Add amenity</button>
    </div>`),
    panel('location', 'Location', 'Manage the address presentation, exterior image and nearby landmarks.', `<div class="field-grid">
      ${textField('location.kicker', 'Kicker')}
      ${textField('location.title', 'Heading', { wide: true, textarea: true })}
      ${textField('location.badge', 'Image badge')}
      ${imageField('location.image', 'Location image')}
      ${textField('location.imageAlt', 'Image description', { wide: true })}
      <div class="field-wide collection">${simpleCollection('location.distances', [{ key: 'place', label: 'Place' }, { key: 'distance', label: 'Distance' }], 'Landmark')}</div>
      <button class="secondary-button add-button" type="button" data-action="add" data-collection="location.distances">Add landmark</button>
    </div>`),
    panel('cta', 'Call to action', 'The final booking message before the footer.', `<div class="field-grid">
      ${textField('cta.kicker', 'Kicker')}
      ${textField('cta.title', 'Heading')}
      ${textField('cta.description', 'Description', { wide: true, textarea: true })}
    </div>`)
  ].join('');

  bindEditorEvents();
}

function bindEditorEvents() {
  editor.querySelectorAll('[data-path]').forEach((input) => {
    input.addEventListener('input', () => setValue(input.dataset.path, input.value));
  });

  editor.querySelectorAll('[data-feature-index]').forEach((input) => {
    input.addEventListener('change', () => {
      siteContent.rooms.items.forEach((room, index) => { room.featured = index === Number(input.dataset.featureIndex); });
      markDirty();
      renderEditor();
    });
  });

  editor.querySelectorAll('[data-upload-path]').forEach((input) => {
    input.addEventListener('change', () => input.files[0] && uploadImage(input.files[0], input.dataset.uploadPath));
  });

  editor.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => handleCollectionAction(button));
  });
}

const newItems = {
  'hero.facts': () => ({ value: 'New', label: 'New highlight' }),
  'intro.highlights': () => 'New highlight',
  'rooms.items': () => ({ name: 'New room', description: '2 guests', price: '₹0', image: 'assets/images/IMG-20230507-WA0012.jpg', imageAlt: 'Guest room at MRS Residency', featured: false }),
  'gallery.images': () => ({ src: 'assets/images/IMG-20230507-WA0012.jpg', alt: 'MRS Residency', label: 'Hotel', caption: 'MRS Residency' }),
  'amenities.items': () => ({ title: 'New amenity', description: 'Describe this amenity.' }),
  'location.distances': () => ({ place: 'Nearby place', distance: '0 min' })
};

function handleCollectionAction(button) {
  const collection = getValue(button.dataset.collection);
  const index = Number(button.dataset.index);
  if (button.dataset.action === 'add') collection.push(newItems[button.dataset.collection]());
  if (button.dataset.action === 'remove') collection.splice(index, 1);
  if (button.dataset.action === 'up' && index > 0) [collection[index - 1], collection[index]] = [collection[index], collection[index - 1]];
  if (button.dataset.action === 'down' && index < collection.length - 1) [collection[index + 1], collection[index]] = [collection[index], collection[index + 1]];
  markDirty();
  renderEditor();
}

async function uploadImage(file, targetPath) {
  if (file.size > 3 * 1024 * 1024) return showToast('Choose an image smaller than 3 MB.', true);
  showToast(`Uploading ${file.name}…`);
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, mimeType: file.type, data: dataUrl.split(',')[1] })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    setValue(targetPath, result.path);
    renderEditor();
    showToast('Image uploaded. Save your changes to publish it.');
  } catch (error) {
    showToast(error.message, true);
  }
}

async function loadEditor() {
  const response = await fetch(`/content/site.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load website content');
  siteContent = await response.json();
  renderEditor();
  markSaved();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';
  const submitButton = loginForm.querySelector('button');
  submitButton.disabled = true;
  submitButton.textContent = 'Signing in…';
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Sign in failed');
    await showAdmin();
  } catch (error) {
    loginError.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Sign in';
  }
});

saveButton.addEventListener('click', async () => {
  saveButton.disabled = true;
  saveButton.textContent = 'Saving…';
  try {
    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteContent)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Save failed');
    markSaved();
    showToast('Changes saved. Vercel will publish them shortly.');
  } catch (error) {
    showToast(error.message, true);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Save changes';
  }
});

document.querySelector('[data-logout]').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.reload();
});

window.addEventListener('beforeunload', (event) => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

async function showAdmin() {
  await loadEditor();
  loginView.hidden = true;
  adminShell.hidden = false;
}

(async () => {
  try {
    const response = await fetch('/api/auth/session', { cache: 'no-store' });
    if (response.ok) await showAdmin();
  } catch {
    loginError.textContent = 'The CMS is unavailable. Check the deployment configuration.';
  }
})();
