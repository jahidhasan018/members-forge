# MembersForge — Form Builder Architecture

> এই document টা Form Builder module এর complete architecture define করে।
> Agent যখন Form Builder নিয়ে কাজ করবে, এই file পড়ে context নেবে।

---

## Overview

Form Builder এ WordPress admin **multiple form** তৈরি করতে পারবে।
প্রতিটা form এর একটা **type** আছে (login, registration, checkout, profile)।
Form publish হলে **shortcode** দিয়ে frontend এ show করা যাবে।

---

## Database Table

```sql
wp_members_forge_forms
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  name            VARCHAR(255)            -- "Registration Form"
  type            VARCHAR(50)             -- 'registration' | 'login' | 'checkout' | 'profile'
  fields          LONGTEXT                -- JSON array of field objects
  settings        LONGTEXT                -- JSON: submit_action, redirect_url, etc.
  shortcode_key   VARCHAR(100) UNIQUE     -- "registration-form-1" → [mf_form key="..."]
  status          VARCHAR(20) DEFAULT 'draft' -- 'active' | 'draft'
  schema_version  INT DEFAULT 1           -- backward compatibility এর জন্য
  created_by      BIGINT UNSIGNED         -- wp_users.ID
  created_at      DATETIME
  updated_at      DATETIME
```

### Fields JSON Structure (প্রতিটা field object)

```json
[
  {
    "id": "uuid-v4",
    "type": "text",
    "label": "First Name",
    "name": "first_name",
    "required": true,
    "order": 0,
    "placeholder": "Enter your first name",
    "options": []
  },
  {
    "id": "uuid-v4",
    "type": "level_selector",
    "label": "Choose Plan",
    "name": "level_id",
    "required": true,
    "order": 1,
    "placeholder": "",
    "options": []
  }
]
```

### Settings JSON Structure

```json
{
  "submit_action": "registration",
  "redirect_url": "/dashboard",
  "auto_login": true,
  "email_notification": true,
  "actions": ["create_user", "send_email"]
}
```

---

## Field Types

| type | কাজ |
|------|-----|
| `text` | নাম, username |
| `email` | Email address |
| `password` | Password + confirm |
| `number` | Phone, age |
| `select` | Dropdown |
| `radio` | Single choice |
| `checkbox` | Multiple choice / terms |
| `textarea` | Bio, notes |
| `date` | Date of birth |
| `level_selector` | Membership plan dropdown (custom) |
| `terms` | Terms & conditions checkbox (custom) |

---

## PHP Architecture

### Layer Flow

```
FormController (thin)
       ↓
FormService (business logic)
       ↓
FieldRegistry + Action System
       ↓
FormRepository
       ↓
Database
```

### FieldRegistry Pattern

```php
// src/Forms/FieldRegistry.php
class FieldRegistry {
    private array $fields = [];

    public function register(string $type, array $config): void {
        $this->fields[$type] = $config;
        // config: label, icon, render (class name), validate (class name)
    }

    public function get_all(): array {
        return $this->fields;
    }

    public function get(string $type): ?array {
        return $this->fields[$type] ?? null;
    }
}

// Plugin.php boot এ:
$registry->register('email', [
    'label'    => 'Email',
    'icon'     => 'email',
    'render'   => EmailFieldRenderer::class,
    'validate' => EmailFieldValidator::class,
]);

// Third-party extension:
do_action('members_forge_register_fields', $registry);
```

### FormService Pattern

```php
// src/Forms/FormService.php
class FormService {
    public function __construct(
        FormRepository $repository,
        FieldRegistry $registry
    ) {}

    public function get_form(int $id): ?array { ... }
    public function save_form(array $data): int|false { ... }
    public function validate_fields(array $fields): bool { ... }
    public function execute_actions(array $form, array $submission): void { ... }
}
```

### Action System

```php
// src/Forms/Actions/FormActionInterface.php
interface FormActionInterface {
    public function execute(array $form, array $data): void;
}

// Available actions:
// - CreateUserAction
// - LoginUserAction
// - CheckoutAction
// - SendEmailAction

// Form settings এ:
// "actions": ["create_user", "send_email"]
// FormService এই array loop করে প্রতিটা action execute করবে
```

### FormRepository Methods

```php
interface FormRepositoryInterface {
    public function get_all(): array;
    public function get_by_id(int $id): ?array;
    public function get_by_key(string $key): ?array;    // shortcode lookup
    public function create(array $data): int|false;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
```

### FormController Routes

| Method | Route | Action |
|--------|-------|--------|
| GET | `/forms` | list all forms |
| POST | `/forms` | create new form |
| GET | `/forms/{id}` | get single form + fields |
| PUT | `/forms/{id}` | update form |
| DELETE | `/forms/{id}` | delete form |
| GET | `/field-types` | available field types from FieldRegistry |
| POST | `/forms/{id}/publish` | draft → active |

---

## Frontend Architecture

### Page 1 — Forms List (`forms` route in App.js)

```
[ + Add New Form ]

Table:
| Name              | Type         | Shortcode                | Actions      |
|-------------------|--------------|--------------------------|--------------|
| Registration Form | registration | [mf_form key="reg-1"]    | Edit  Delete |
| Login Form        | login        | [mf_form key="login-1"]  | Edit  Delete |
```

Component: `assets/src/components/Forms/Forms.js`

### Page 2 — Form Builder (`form-builder` route in App.js)

URL param: `?form_id=1` (edit existing) বা নতুন form এর জন্য empty

```
┌─────────────────┬──────────────────────────┬──────────────────┐
│  FieldPalette   │      BuilderCanvas        │ FieldSettings    │
│  ─────────────  │  ─────────────────────── │  Panel           │
│  📝 Text        │  [First Name]  ✕  ↕      │                  │
│  📧 Email       │  [Email]       ✕  ↕      │  Label:          │
│  🔒 Password    │  [Choose Plan] ✕  ↕      │  Required: ☑    │
│  ☑  Checkbox    │                           │  Placeholder:    │
│  📋 Select      │  + Add Field              │                  │
└─────────────────┴──────────────────────────┴──────────────────┘
                                    [ Save Form ]
```

### Component Structure

```
assets/src/components/
├── Forms/
│   ├── Forms.js                  ← form list page
│   └── Forms.test.js
└── FormBuilder/
    ├── FormBuilder.js            ← main builder page (composes below)
    ├── FormBuilder.test.js
    ├── BuilderCanvas.js          ← center: draggable field list
    ├── FieldPalette.js           ← left: available field types
    ├── FieldSettingsPanel.js     ← right: selected field config
    └── useFormBuilderState.js    ← central state hook
```

### Central State Hook

```javascript
// useFormBuilderState.js
const useFormBuilderState = () => {
    const [fields, setFields]               = useState([]);
    const [selectedFieldId, setSelectedId]  = useState(null);
    const [formMeta, setFormMeta]           = useState({ name: '', type: 'registration' });

    const addField    = (type) => { ... };
    const removeField = (id)   => { ... };
    const updateField = (id, changes) => { ... };
    const reorderFields = (fromIndex, toIndex) => { ... };

    return { fields, selectedFieldId, formMeta, addField, removeField, updateField, reorderFields, setSelectedId, setFormMeta };
};
```

---

## Shortcode

```
[mf_form key="registration-form-1"]
```

- `key` = `shortcode_key` column (unique slug, numeric ID না)
- Portable across environments
- Future: PHP `ShortcodeRenderer` class `FieldRegistry` থেকে field render করবে

---

## Security Requirements

- REST nonce validation সব routes এ
- `fields` JSON save এর আগে sanitize করো
- Field `type` whitelist validate করো — শুধু FieldRegistry তে registered types allow
- Form submit এ rate limiting (future)
- `created_by` = current user ID (audit trail)

---

## PHP Hooks (Extensibility)

```php
// Form submit এর আগে/পরে:
do_action('members_forge_before_form_submit', $form_id, $data);
do_action('members_forge_after_form_submit',  $form_id, $data, $result);

// নতুন field type register করার সুযোগ:
do_action('members_forge_register_fields', $registry);
```

## JS Hooks (Future)

```javascript
// Field add/update/save event:
onFieldAdd(fieldType)
onFieldUpdate(fieldId, changes)
onFormSave(formData)
```

---

## Task List (Implementation Order)

| Task | কাজ | Status |
|------|-----|--------|
| TASK-07 | Migrator.php — `wp_members_forge_forms` table add | ✅ |
| TASK-08 | `FormRepository` + interface + unit test | ✅ |
| TASK-09 | `FormService` + unit test | ❌ |
| TASK-10 | `FormController` + unit test | ❌ |
| TASK-11 | `FieldRegistry` — field types register | ❌ |
| TASK-12 | `ApiRouter` — /forms + /field-types routes | ❌ |
| TASK-13 | `Plugin.php` — wire করো | ❌ |
| TASK-14 | `Forms.js` — form list page + test | ❌ |
| TASK-15 | `FormBuilder.js` — builder UI + test | ❌ |
| TASK-16 | `App.js` wiring + build + commit | ❌ |

---

## File Locations

```
src/
├── Forms/
│   ├── FieldRegistry.php
│   ├── FormService.php
│   ├── Actions/
│   │   ├── FormActionInterface.php
│   │   ├── CreateUserAction.php
│   │   └── SendEmailAction.php
├── Repositories/
│   └── FormRepository.php
├── Interfaces/
│   └── FormRepositoryInterface.php
└── API/Controllers/
    └── FormController.php

tests/Unit/
├── API/
│   └── FormControllerTest.php
├── Repositories/
│   └── FormRepositoryTest.php
└── Forms/
    └── FormServiceTest.php
```
