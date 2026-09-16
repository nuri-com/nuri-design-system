/* Nuri DS browser harness: phone shell mounted from the plain bundle, no build step. */
const h = React.createElement;
const { NuriRoot, Screen, Header, Footer, Topbar, TopbarLeading, TopbarTrailing, IconButton, NuriIcon, Text, View, Scroll, TabBar, TabBarItem, TabBarItemIcon, TabBarItemLabel } = window.Nuri;

function App() {
  const [tab, setTab] = React.useState('home');
  const tabs = [
    { id: 'home', icon: 'bank', label: 'Home' },
    { id: 'wallet', icon: 'wallet', label: 'Wallet' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];
  return h(NuriRoot, { mode: 'light', accent: 'lilac' },
    h(Screen, null,
      h(Header, { safeAreaTop: true, chrome: 'canvas' },
        h(Topbar, null,
          h(TopbarLeading, null, h(NuriIcon, { name: 'nuri' }), h(Text, { size: 'lg', emphasis: true }, 'Nuri')),
          h(TopbarTrailing, null, h(IconButton, { icon: 'settings', variant: 'soft', accessibilityLabel: 'Settings' })))),
      h(Scroll, null,
        h(View, { direction: 'column', align: 'stretch', gap: 'lg', paddingX: 'lg', paddingY: 'md' },
          h(Text, { size: 'xl' }, 'Nuri DS browser harness'),
          h(Text, { muted: true }, 'Phone-width shell rendered by _ds_bundle.js. Active tab: ' + tab + '.'))),
      h(Footer, { safeAreaBottom: true, chrome: 'canvas' },
        h(TabBar, null,
          tabs.map((t) => h(TabBarItem, { key: t.id, selected: tab === t.id, onPress: () => setTab(t.id) },
            h(TabBarItemIcon, { name: t.icon }),
            h(TabBarItemLabel, null, t.label)))))));
}

ReactDOM.createRoot(document.getElementById('ds-root')).render(h(App));
