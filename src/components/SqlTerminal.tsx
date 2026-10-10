import React, { useState } from 'react';
import { QueryExecutionResult } from '../types/game';
import { Play, RotateCcw, Copy, Check, Terminal, Clock, Rows3, AlertOctagon } from 'lucide-react';

interface SqlTerminalProps {
  query: string;
  onChangeQuery: (newQuery: string) => void;
  onCastQuery: () => void;
  isExecuting: boolean;
  result: QueryExecutionResult | null;
  chamberTitle: string;
  chamberCode: string;
  onResetQuery: () => void;
}

export const SqlTerminal: React.FC<SqlTerminalProps> = ({
  query,
  onChangeQuery,
  onCastQuery,
  isExecuting,
  result,
  chamberTitle,
  chamberCode,
  onResetQuery,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter executes query
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCastQuery();
    }
  };

  const totalPages = result ? Math.max(1, Math.ceil(result.rowCount / rowsPerPage)) : 1;
  const displayedRows = result
    ? result.rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : [];

  return (
    <div className="bg-dungeon-abyss border-2 border-dungeon-border flex flex-col h-full shadow-pixel">
      {/* Vintage CRT Window Header */}
      <div className="bg-dungeon-chamber border-b-2 border-dungeon-border px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-mana-core" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-parchment-white">
            {chamberCode}: {chamberTitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-parchment-rune font-display hidden sm:inline">
            PRESS CTRL+ENTER TO CAST
          </span>
          <div className="flex items-center space-x-1.5 pl-2 border-l border-dungeon-highlight">
            <span className="w-2.5 h-2.5 bg-dungeon-crypt border border-dungeon-highlight inline-block" />
            <span className="w-2.5 h-2.5 bg-dungeon-crypt border border-dungeon-highlight inline-block" />
            <span className="w-2.5 h-2.5 bg-glyph-crimson inline-block" />
          </div>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="p-3 bg-dungeon-abyss flex-1 flex flex-col min-h-[220px] max-h-[340px]">
        <div className="relative flex-1 flex flex-col">
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              onClick={handleCopy}
              className="bg-dungeon-chamber/80 hover:bg-dungeon-crypt border border-dungeon-highlight text-parchment-rune hover:text-mana-core p-1 text-xs"
              title="Copy Incantation"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-glyph-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onResetQuery}
              className="bg-dungeon-chamber/80 hover:bg-dungeon-crypt border border-dungeon-highlight text-parchment-rune hover:text-glyph-crimson p-1 text-xs"
              title="Reset Editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="-- Inscribe your SQL incantation here...&#10;SELECT * FROM customers LIMIT 10;"
            className="w-full flex-1 bg-dungeon-abyss text-parchment-white font-code text-xs sm:text-sm p-3 border-2 border-dungeon-highlight focus:border-mana-core focus:outline-none resize-none leading-relaxed selection:bg-mana-core selection:text-dungeon-abyss"
            spellCheck={false}
          />
        </div>

        {/* Action Toolbar */}
        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onCastQuery}
              disabled={isExecuting}
              className="bg-mana-core hover:bg-mana-glow text-dungeon-abyss border-2 border-parchment-white font-display font-bold text-xs uppercase px-4 py-2 pixel-btn flex items-center gap-2 transition-transform disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'CASTING SPELL...' : 'CAST QUERY (RUN)'}</span>
            </button>

            <button
              onClick={onResetQuery}
              className="bg-dungeon-chamber hover:bg-dungeon-crypt text-parchment-rune hover:text-parchment-white border-2 border-dungeon-highlight font-display text-xs px-3 py-2 pixel-btn"
            >
              CLEAR
            </button>
          </div>

          {/* Execution Telemetry Status */}
          {result && (
            <div className="flex items-center gap-3 text-xs font-display">
              <div className="flex items-center gap-1 text-parchment-rune">
                <Clock className="w-3 h-3 text-mana-core" />
                <span>{result.executionTimeMs} ms</span>
              </div>
              <div className="flex items-center gap-1 text-parchment-rune">
                <Rows3 className="w-3 h-3 text-quest-gold" />
                <span>{result.rowCount} ROWS</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Query Output / Results View */}
      <div className="border-t-2 border-dungeon-border flex-1 flex flex-col bg-dungeon-chamber overflow-hidden">
        {/* Output Header */}
        <div className="bg-dungeon-crypt px-3 py-1.5 border-b border-dungeon-border flex items-center justify-between text-xs font-display">
          <span className="text-parchment-rune uppercase font-bold">
            🔮 INCANTATION OUTPUT / DATASET VIEWER
          </span>
          {result && result.rowCount > rowsPerPage && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2 py-0.5 bg-dungeon-chamber border border-dungeon-highlight disabled:opacity-40 text-[10px]"
              >
                PREV
              </button>
              <span className="text-[10px] text-parchment-rune px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-0.5 bg-dungeon-chamber border border-dungeon-highlight disabled:opacity-40 text-[10px]"
              >
                NEXT
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {result?.error && (
          <div className="p-3 bg-glyph-crimson/10 border-l-4 border-glyph-crimson m-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-glyph-crimson flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-display font-bold text-glyph-crimson block mb-1">
                  SPELL FIZZLE (SQL ERROR)
                </span>
                <p className="font-code text-parchment-white whitespace-pre-wrap leading-relaxed">
                  {result.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-parchment-rune text-xs">
            <Terminal className="w-8 h-8 text-dungeon-highlight mb-2" />
            <p>The output scrying orb is silent.</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Type or insert an SQL query above and click <span className="text-mana-core font-bold">CAST QUERY</span>.
            </p>
          </div>
        )}

        {/* Result Table Grid */}
        {result?.success && result.rowCount === 0 && (
          <div className="p-4 text-center text-xs text-parchment-rune">
            0 records returned. The query executed successfully, but matched zero rows.
          </div>
        )}

        {result?.success && result.rowCount > 0 && (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-dungeon-crypt border-b-2 border-dungeon-highlight sticky top-0 z-10">
                  <th className="p-2 text-[10px] font-display text-quest-gold uppercase border-r border-dungeon-highlight w-10 text-center">
                    #
                  </th>
                  {result.columns.map(col => (
                    <th
                      key={col}
                      className="p-2 text-[10px] font-display text-mana-core uppercase tracking-wider border-r border-dungeon-highlight whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, idx) => {
                  const absoluteIndex = (currentPage - 1) * rowsPerPage + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="border-b border-dungeon-border/50 hover:bg-dungeon-crypt/60 transition-colors font-code"
                    >
                      <td className="p-2 text-center text-[10px] text-parchment-rune border-r border-dungeon-border bg-dungeon-abyss/40">
                        {absoluteIndex}
                      </td>
                      {result.columns.map(col => {
                        const val = row[col];
                        return (
                          <td
                            key={col}
                            className="p-2 border-r border-dungeon-border/50 text-parchment-white whitespace-nowrap max-w-[200px] truncate"
                          >
                            {val === null || val === undefined ? (
                              <span className="text-slate-600 italic">NULL</span>
                            ) : typeof val === 'object' ? (
                              JSON.stringify(val)
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
