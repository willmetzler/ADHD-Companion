# Phase 4 Project Template

## Getting Started - Git & Github

Elect one person to clone (DON'T FORK) this project to their local computer. That person will then run this command:

```
git remote remove origin
```

Navigate to github and create a new public repository, choose not to add a README, license, or any additional information. Once the empty repo has been created, follow the directions to upload an existing repository.

Add your collaborators under `Settings > Collaborators` on github.

## Getting Started - Flask

Create a `.env` file and create a line similar to this:

```
SECRET_KEY=abcdef1234567890
```

You can generate a proper secret key inside a python repl like so:

```
import secrets; secrets.token_hex(16)
```

Inside the project run these commands:

```
pipenv install
pipenv shell
cd server
```

Begin by building your first model. From there:

```
flask db init
flask db migrate -m "example migration message"
flask db upgrade
```

Any additional changes you make will only need the `flask db migrate -m "example migration message"` and `flask db upgrade`. It's recommended you build one model at a time to catch errors more easily.

Once your database has been upgraded you may run the server with:

```
python app.py
```

In order to follow best practices with the React server proxy, begin all your route URLs with `/api` (for example `/api/users` for users route).

A seed file has been provided under `seed.py`. To run the seed file:

```
python seed.py
```

## Getting Started - React

The `client` directory contains a React template built by Vite, however you may replace it with one built by `create-react-app` or any other tool if you wish.

At the end of any command using `npm`, append `--prefix client` so that it properly uses the `client` directory or else be sure to `cd client` beforehand.

To start your React server, run:

```
npm install --prefix client
npm run dev --prefix client
```

When making fetch requests, leave out the `localhost:5555` portion since a proxy already exists to that domain and instead prefix every request with `/api` to properly utilize the proxy request feature.

## Conclusion

Once you've completed work on this project, replace this README with one of your own devising!