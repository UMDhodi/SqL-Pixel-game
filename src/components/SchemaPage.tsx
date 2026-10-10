import React, { useState } from 'react';
import { TableSchema } from '../types/game';
import {
  BookOpen, Search, X, Database, Key, Link2, Eye, FileCode2,
  Table, ChevronRight, Copy, Check, ArrowLeft, Terminal, ShieldAlert
} from 'lucide-react';

interface SchemaPageProps {
  schemas: TableSchema[];
  onBackToHome?: () => void;
  onBackToIde: () => void;
  onInsertQueryToIde: (sql: string) => void;
}

export const SchemaPage: React.FC<SchemaPageProps> = ({
  schemas,
  onBackToHome,
  onBackToIde,
  onInsertQueryToIde,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('tavern_orders');
  const [activeTab, setActiveTab] = useState<'columns' | 'preview' | 'er'>('er');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedName, setCopiedName] = useState(false);

  const activeSchema = schemas.find(s => s.tableName === selectedTable) || schemas[0];

  const handleCopyTableName = () => {
    navigator.clipboard.writeText(activeSchema.tableName);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dungeon-abyss text-parchment-white flex flex-col font-code">
      {/* 1. TOP HEADER */}
      <header className="border-b-2 border-dungeon-border bg-dungeon-chamber px-4 py-2.5 flex items-center justify-between gap-3 shadow-pixel sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-dungeon-abyss border-2 border-mana-core flex items-center justify-center text-mana-core">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-wider text-parchment-white uppercase">
                DB SCHEMA & REALM EXPLORER
              </span>
              <span className="bg-quest-gold text-dungeon-abyss text-[9px] font-display font-bold px-1 py-0.2">
                [SQLite 3.4+]
              </span>
            </div>
            <div className="text-[10px] text-parchment-rune flex items-center gap-2">
              <span>● ACTIVE DIALECT: SQLite</span>
              <span>• WORLD 1: REALM OF RELATIONAL DATA</span>
              <span>• TABLES DISCOVERED: 4 / 5</span>
            </div>
          </div>
        </div>

        {/* Right Search & Close */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-parchment-rune absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tables, columns, type..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-dungeon-abyss border border-dungeon-highlight pl-8 pr-3 py-1.5 text-xs text-parchment-white focus:outline-none focus:border-mana-core w-60"
            />
          </div>
          <button
            onClick={onBackToHome || onBackToIde}
            className="flex items-center gap-1.5 bg-dungeon-crypt hover:bg-glyph-crimson text-parchment-white border border-dungeon-highlight px-2.5 py-1.5 pixel-btn text-xs font-display font-bold"
            title="Return to Home"
          >
            <span>HOME /</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. SUB-NAV BAR: BACK TO HOME */}
      <div className="bg-dungeon-crypt border-b border-dungeon-border px-4 py-2 flex items-center justify-between">
        <button
          onClick={onBackToHome || onBackToIde}
          className="flex items-center gap-2 bg-dungeon-abyss hover:bg-mana-core hover:text-dungeon-abyss text-mana-core border border-mana-core px-3 py-1.5 text-xs font-display font-bold pixel-btn transition-colors"
          title="Return to Campaign Home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </button>
        <div className="text-[11px] text-parchment-rune flex items-center gap-2 font-display">
          <span>CURRENT CODEX:</span>
          <span className="text-parchment-white font-bold">DATABASE SCHEMA EXPLORER</span>
        </div>
      </div>

      {/* 3. MAIN 3-COLUMN WORKBENCH */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT COLUMN (3 cols): Grimoire Tables List */}
        <aside className="lg:col-span-3 bg-dungeon-chamber border-2 border-dungeon-border p-3 space-y-3 flex flex-col shadow-pixel">
          <div className="flex items-center justify-between border-b border-dungeon-border pb-2">
            <span className="font-display font-bold text-xs uppercase text-parchment-white">
              GRIMOIRE TABLES
            </span>
            <span className="text-[10px] bg-mana-core/20 text-mana-core px-1.5 py-0.2 font-display font-bold">
              4 ACTIVE
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 text-[10px] font-display flex-wrap">
            <span className="bg-mana-core text-dungeon-abyss font-bold px-2 py-0.5 cursor-pointer">All (4)</span>
            <span className="bg-dungeon-crypt text-parchment-rune px-2 py-0.5 border border-dungeon-border cursor-pointer">Quest (2)</span>
            <span className="bg-dungeon-crypt text-parchment-rune px-2 py-0.5 border border-dungeon-border cursor-pointer">Dimensions</span>
            <span className="bg-dungeon-crypt text-parchment-rune px-2 py-0.5 border border-dungeon-border cursor-pointer">Fact Logs</span>
          </div>

          {/* Tables List */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            {schemas.map(tbl => {
              const isSelected = tbl.tableName === selectedTable;
              return (
                <button
                  key={tbl.tableName}
                  onClick={() => setSelectedTable(tbl.tableName)}
                  className={`w-full text-left p-2.5 border transition-all text-xs font-code block ${
                    isSelected
                      ? 'bg-dungeon-crypt border-mana-core shadow-pixel-sm'
                      : 'bg-dungeon-abyss border-dungeon-border hover:border-dungeon-highlight'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-parchment-white flex items-center gap-1.5">
                      <span>{tbl.tableName === 'tavern_orders' ? '🍺' : tbl.tableName === 'heroes' ? '🧙‍♂️' : tbl.tableName === 'dungeon_raids' ? '⚔️' : '💎'}</span>
                      <span className="truncate">{tbl.tableName}</span>
                      {tbl.tableName === 'tavern_orders' && (
                        <span className="w-1.5 h-1.5 bg-mana-core rounded-full inline-block" />
                      )}
                    </span>
                    {tbl.tableName === 'tavern_orders' && (
                      <span className="bg-quest-gold text-dungeon-abyss text-[9px] font-display font-bold px-1">
                        QUEST #02
                      </span>
                    )}
                    {tbl.tableName === 'heroes' && (
                      <span className="text-[9px] bg-glyph-emerald/20 text-glyph-emerald px-1 font-display">
                        DIMENSION
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-parchment-rune mt-1 line-clamp-1">
                    {tbl.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-parchment-rune mt-1.5 border-t border-dungeon-border/60 pt-1 font-display">
                    <span>{tbl.rowCount.toLocaleString()} rows</span>
                    <span>{tbl.columns.length} cols</span>
                    <span className="text-quest-gold">PK: {tbl.columns.find(c => c.isPrimaryKey)?.name}</span>
                  </div>
                </button>
              );
            })}

            {/* Locked Table Representation */}
            <div className="p-2.5 border border-dungeon-border bg-dungeon-abyss/40 opacity-50 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-display">
                <span className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>guild_alliances</span>
                </span>
                <span className="text-[10px]">CH. 03</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 italic">
                Requires Master Aggregates clearance
              </p>
            </div>
          </div>

          {/* Bottom DDL & Name Buttons */}
          <div className="flex gap-2 pt-2 border-t border-dungeon-border text-xs font-display">
            <button
              onClick={() => alert(`-- DDL:\nCREATE TABLE ${activeSchema.tableName} (\n  ${activeSchema.columns.map(c => `${c.name} ${c.type}`).join(',\n  ')}\n);`)}
              className="flex-1 bg-dungeon-crypt hover:bg-dungeon-highlight border border-dungeon-highlight text-parchment-rune hover:text-parchment-white py-1.5 pixel-btn"
            >
              Export DDL
            </button>
            <button
              onClick={handleCopyTableName}
              className="flex-1 bg-dungeon-crypt hover:bg-dungeon-highlight border border-dungeon-highlight text-parchment-rune hover:text-mana-core py-1.5 pixel-btn flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedName ? 'COPIED!' : 'Copy Name'}</span>
            </button>
          </div>
        </aside>

        {/* CENTER COLUMN (6 cols): Schema Inspector & Interactive ER Relationships */}
        <section className="lg:col-span-6 bg-dungeon-chamber border-2 border-dungeon-border flex flex-col shadow-pixel">
          {/* Section Header */}
          <div className="bg-dungeon-crypt p-3 border-b border-dungeon-border flex items-center justify-between text-xs font-display">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-quest-gold text-dungeon-abyss font-bold px-1.5 py-0.2 uppercase">
                  SCHEMA INSPECTOR
                </span>
                <span className="text-glyph-emerald">STATUS: VERIFIED</span>
              </div>
              <div className="text-sm font-bold text-parchment-white mt-1">
                TABLE: <span className="text-mana-core">{activeSchema.tableName}</span>
              </div>
            </div>
            <div className="text-[11px] text-parchment-rune font-code">
              Storage Size: <span className="text-quest-gold font-bold">48.2 KB</span>
            </div>
          </div>

          <p className="p-3 text-xs text-parchment-rune border-b border-dungeon-border leading-relaxed bg-dungeon-abyss/40">
            {activeSchema.description}
          </p>

          {/* Sub Tabs */}
          <div className="grid grid-cols-3 border-b-2 border-dungeon-border text-xs font-display">
            <button
              onClick={() => setActiveTab('columns')}
              className={`py-2 text-center uppercase font-bold transition-colors ${
                activeTab === 'columns'
                  ? 'bg-dungeon-crypt text-mana-core border-b-2 border-b-mana-core'
                  : 'text-parchment-rune hover:text-parchment-white bg-dungeon-chamber'
              }`}
            >
              Columns & Constraints
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 text-center uppercase font-bold transition-colors ${
                activeTab === 'preview'
                  ? 'bg-dungeon-crypt text-mana-core border-b-2 border-b-mana-core'
                  : 'text-parchment-rune hover:text-parchment-white bg-dungeon-chamber'
              }`}
            >
              Data Preview (Sample)
            </button>
            <button
              onClick={() => setActiveTab('er')}
              className={`py-2 text-center uppercase font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'er'
                  ? 'bg-dungeon-crypt text-quest-gold border-b-2 border-b-quest-gold'
                  : 'text-parchment-rune hover:text-quest-gold bg-dungeon-chamber'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>ER Relationships (CANVAS)</span>
            </button>
          </div>

          {/* TAB 1: COLUMNS & CONSTRAINTS */}
          {activeTab === 'columns' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-dungeon-crypt border-b border-dungeon-border text-[10px] font-display text-quest-gold uppercase">
                    <th className="p-2">COLUMN</th>
                    <th className="p-2">TYPE</th>
                    <th className="p-2">KEY</th>
                    <th className="p-2">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="font-code">
                  {activeSchema.columns.map(col => (
                    <tr key={col.name} className="border-b border-dungeon-border/50 hover:bg-dungeon-crypt/50">
                      <td className="p-2 text-parchment-white font-bold">{col.name}</td>
                      <td className="p-2 text-mana-core text-[11px]">{col.type}</td>
                      <td className="p-2 text-[10px] font-display">
                        {col.isPrimaryKey && (
                          <span className="bg-quest-gold/20 text-quest-gold px-1.5 py-0.5 border border-quest-gold font-bold">
                            PK
                          </span>
                        )}
                        {col.isForeignKey && (
                          <span className="bg-mana-core/20 text-mana-core px-1.5 py-0.5 border border-mana-core font-bold">
                            FK
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-parchment-rune text-[11px]">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: DATA PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex-1 overflow-auto p-3">
              <table className="w-full text-left text-xs border-collapse font-code">
                <thead>
                  <tr className="bg-dungeon-crypt border-b border-dungeon-border text-[10px] font-display text-mana-core uppercase">
                    {activeSchema.columns.map(c => (
                      <th key={c.name} className="p-2 whitespace-nowrap">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSchema.sampleData.map((row, i) => (
                    <tr key={i} className="border-b border-dungeon-border/50 hover:bg-dungeon-crypt/50">
                      {activeSchema.columns.map(c => (
                        <td key={c.name} className="p-2 text-parchment-white whitespace-nowrap">
                          {String(row[c.name] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ER RELATIONSHIPS (EXACT MATCH TO IMAGE 2 CANVAS) */}
          {activeTab === 'er' && (
            <div className="flex-1 flex flex-col bg-dungeon-abyss relative p-3 overflow-hidden">
              {/* Canvas Controls Toolbar */}
              <div className="flex items-center justify-between text-[10px] font-display bg-dungeon-crypt p-2 border border-dungeon-border mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="bg-quest-gold text-dungeon-abyss font-bold px-1.5 py-0.5">CANVAS</span>
                  <button className="px-1.5 py-0.5 bg-dungeon-abyss border border-dungeon-highlight">+</button>
                  <span className="px-1.5 text-parchment-rune">100%</span>
                  <button className="px-1.5 py-0.5 bg-dungeon-abyss border border-dungeon-highlight">-</button>
                  <button className="px-1.5 py-0.5 bg-dungeon-abyss border border-dungeon-highlight">Reset</button>
                  <span className="text-parchment-rune pl-2">Cardinality: Crow's Foot (1:N)</span>
                </div>
                <div className="flex items-center gap-2 text-parchment-rune">
                  <span className="flex items-center gap-1"><Key className="w-3 h-3 text-quest-gold" /> PK</span>
                  <span className="flex items-center gap-1"><Link2 className="w-3 h-3 text-mana-core" /> FK</span>
                  <span className="text-mana-core font-bold">Active Quest Link</span>
                </div>
              </div>

              {/* 2x2 ER Cards Grid simulating diagram in Image 2 */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
                {/* 1. heroes table card */}
                <div className="bg-dungeon-chamber border-2 border-dungeon-highlight p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-parchment-white font-bold flex items-center gap-1">
                      <span>🧙‍♂️</span> heroes
                    </span>
                    <span className="text-[9px] bg-glyph-emerald/20 text-glyph-emerald px-1 font-bold">DIMENSION</span>
                  </div>
                  <div className="text-[11px] font-code space-y-0.5 pt-1 border-t border-dungeon-border">
                    <div className="flex justify-between text-quest-gold">
                      <span>🔑 id</span> <span>INT [PK]</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>hero_name</span> <span>VARCHAR(64)</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>class_archetype</span> <span>TEXT</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>guild_rank</span> <span>VARCHAR(32)</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>level</span> <span>INT</span>
                    </div>
                  </div>
                </div>

                {/* 2. tavern_orders table card (QUEST FOCUS) */}
                <div className="bg-dungeon-chamber border-2 border-mana-core p-2.5 space-y-1.5 shadow-pixel-sm">
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-mana-core font-bold flex items-center gap-1">
                      <span>🍺</span> tavern_orders ●
                    </span>
                    <span className="text-[9px] bg-quest-gold text-dungeon-abyss px-1 font-bold">QUEST FOCUS</span>
                  </div>
                  <div className="text-[11px] font-code space-y-0.5 pt-1 border-t border-dungeon-border">
                    <div className="flex justify-between text-quest-gold">
                      <span>🔑 id</span> <span>INT [PK]</span>
                    </div>
                    <div className="flex justify-between text-mana-core font-bold">
                      <span>🔗 hero_id</span> <span>INT [FK → heroes.id]</span>
                    </div>
                    <div className="flex justify-between text-quest-gold font-bold">
                      <span>⭐ gold_spent</span> <span>NUMERIC(10,2)</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>quest_class</span> <span>TEXT</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>order_timestamp</span> <span>DATETIME</span>
                    </div>
                  </div>
                </div>

                {/* 3. dungeon_raids table card */}
                <div className="bg-dungeon-chamber border-2 border-dungeon-highlight p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-parchment-white font-bold flex items-center gap-1">
                      <span>⚔️</span> dungeon_raids
                    </span>
                    <span className="text-[9px] bg-glyph-violet/20 text-glyph-violet px-1 font-bold">LOGS</span>
                  </div>
                  <div className="text-[11px] font-code space-y-0.5 pt-1 border-t border-dungeon-border">
                    <div className="flex justify-between text-quest-gold">
                      <span>🔑 raid_id</span> <span>INT [PK]</span>
                    </div>
                    <div className="flex justify-between text-mana-core">
                      <span>🔗 hero_id</span> <span>INT [FK → heroes.id]</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>boss_defeated</span> <span>VARCHAR(64)</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>gold_bounty</span> <span>NUMERIC</span>
                    </div>
                  </div>
                </div>

                {/* 4. inventory_relics table card */}
                <div className="bg-dungeon-chamber border-2 border-dungeon-highlight p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-display">
                    <span className="text-parchment-white font-bold flex items-center gap-1">
                      <span>💎</span> inventory_relics
                    </span>
                    <span className="text-[9px] bg-quest-gold/20 text-quest-gold px-1 font-bold">EQUIPMENT</span>
                  </div>
                  <div className="text-[11px] font-code space-y-0.5 pt-1 border-t border-dungeon-border">
                    <div className="flex justify-between text-quest-gold">
                      <span>🔑 item_id</span> <span>INT [PK]</span>
                    </div>
                    <div className="flex justify-between text-mana-core">
                      <span>🔗 order_id</span> <span>INT [FK → tavern_orders.id]</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>relic_name</span> <span>VARCHAR(64)</span>
                    </div>
                    <div className="flex justify-between text-parchment-rune">
                      <span>rarity_tier</span> <span>TEXT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Relationship Inspector Footer */}
              <div className="mt-2 bg-dungeon-crypt p-2 border border-dungeon-border flex items-center justify-between text-xs font-display">
                <span className="text-mana-core font-bold flex items-center gap-1.5">
                  ⚡ RELATIONSHIP INSPECTOR: tavern_orders .. heroes
                </span>
                <span className="text-[10px] bg-dungeon-abyss border border-dungeon-border px-1.5 text-quest-gold">
                  Many-to-One (N:1)
                </span>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN (3 cols): Quest Lore Clues & Quick Query Templates */}
        <aside className="lg:col-span-3 bg-dungeon-chamber border-2 border-dungeon-border p-3 space-y-4 flex flex-col shadow-pixel">
          <div className="border-b border-dungeon-border pb-2 text-xs font-display font-bold text-parchment-white flex items-center gap-1.5">
            <span>🔮</span> QUEST LORE & SNIPPETS
          </div>

          {/* Lore Objective Clue */}
          <div className="bg-dungeon-abyss border border-dungeon-border p-3 space-y-2">
            <span className="text-[11px] font-display text-quest-gold uppercase font-bold block">
              📜 LORE OBJECTIVE CLUE
            </span>
            <p className="text-xs text-parchment-rune leading-relaxed">
              The barkeep only wants patrons who spent strictly greater than 75 gold pieces. Notice how{' '}
              <span className="text-parchment-white font-bold">Robin Hawk</span> spent 90g and qualifies, while casual patrons with &le;75g are omitted from the ledger!
            </p>
          </div>

          {/* Quick Query Templates */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-display text-parchment-rune">
              <span>⚡ QUICK QUERY TEMPLATES</span>
              <span className="text-mana-core">CLICK TO USE</span>
            </div>

            {/* Template 1 */}
            <div className="bg-dungeon-abyss border border-dungeon-border p-2 space-y-1.5 text-xs font-code">
              <span className="text-[10px] text-parchment-rune block">// Preview 5 records:</span>
              <code className="text-mana-core text-[11px] block">
                SELECT * FROM tavern_orders LIMIT 5;
              </code>
              <button
                onClick={() => onInsertQueryToIde('SELECT * FROM tavern_orders LIMIT 5;')}
                className="w-full bg-dungeon-crypt hover:bg-mana-core hover:text-dungeon-abyss text-[10px] font-display font-bold py-1 border border-dungeon-highlight"
              >
                INSERT TO IDE
              </button>
            </div>

            {/* Template 2: Solver */}
            <div className="bg-dungeon-abyss border border-quest-gold p-2 space-y-1.5 text-xs font-code">
              <div className="flex justify-between text-[10px] font-display text-quest-gold">
                <span>// Quest #02 Solution:</span>
                <span className="bg-quest-gold text-dungeon-abyss px-1 font-bold">SOLVER</span>
              </div>
              <code className="text-quest-gold text-[11px] block">
                SELECT id, hero_name, gold_spent FROM tavern_orders WHERE gold_spent &gt; 75 ORDER BY gold_spent DESC;
              </code>
              <button
                onClick={() => onInsertQueryToIde('SELECT id, hero_name, gold_spent FROM tavern_orders WHERE gold_spent > 75 ORDER BY gold_spent DESC;')}
                className="w-full bg-quest-gold hover:bg-quest-amber text-dungeon-abyss text-[10px] font-display font-bold py-1 pixel-btn"
              >
                INSERT TO IDE
              </button>
            </div>
          </div>

          {/* Database Engine Stats */}
          <div className="bg-dungeon-abyss border border-dungeon-border p-2.5 text-[11px] font-code space-y-1">
            <span className="font-display font-bold text-[10px] text-parchment-rune block border-b border-dungeon-border pb-1">
              DATABASE ENGINE STATS
            </span>
            <div className="flex justify-between text-parchment-rune">
              <span>Table Type:</span> <span className="text-parchment-white">Heap / B-Tree</span>
            </div>
            <div className="flex justify-between text-parchment-rune">
              <span>Primary Index:</span> <span className="text-mana-core">idx_tavern_pk</span>
            </div>
            <div className="flex justify-between text-parchment-rune">
              <span>Secondary Index:</span> <span className="text-mana-core">idx_orders_gold</span>
            </div>
            <div className="flex justify-between text-parchment-rune">
              <span>Constraint:</span> <span className="text-quest-gold">CHECK(gold_spent &gt;= 0)</span>
            </div>
          </div>

          {/* Back to IDE CTA */}
          <div className="pt-2 border-t border-dungeon-border space-y-1">
            <span className="text-[10px] text-parchment-rune block text-center">Press ESC to return</span>
            <button
              onClick={onBackToIde}
              className="w-full bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs py-2.5 pixel-btn flex items-center justify-center gap-2"
            >
              <span>BACK TO IDE ⚔️</span>
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};
